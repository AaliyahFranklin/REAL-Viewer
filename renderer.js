const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const MIN_LIFESPAN = 30000  // 30s
const MAX_LIFESPAN = 60000  // 60s
const FADE_TIME = 2000; // how long fade takes
let currentFolder = null
let imageQueue = []

async function pickFolder() {
  const folder = await window.api.pickFolder()
  if (folder) {
    localStorage.setItem('folderPath', folder)
    displayImages(folder)
  }
}

async function displayImages(folder) {
  currentFolder = folder

  // clear out anything from a previous folder
  document.querySelectorAll('.img').forEach(img => {
    clearTimeout(img.dataset.timerId)
    img.remove()
  })

  imageQueue = await window.api.getImages(folder)
  checkAndSpawn()
}

function checkAndSpawn() {
  const target = parseInt(document.getElementById('imgNumSlider').value)
  let currentCount = document.querySelectorAll('.img:not(.pinned)').length

  while (currentCount < target && imageQueue.length > 0) {
    const nextPath = imageQueue.shift()
    spawnImage(nextPath)
    currentCount++
  }
}

function spawnImage(imagePath) {
  const gallery = document.getElementById('gallery')
  const img = document.createElement('img')
  img.draggable = false
  img.classList.add('img')
  img.src = imagePath
  img.style.opacity = '0'
  img.style.transition = `opacity ${FADE_TIME}ms ease`
  const x = Math.random() * (window.innerWidth - 200)
  const y = Math.random() * (window.innerHeight - 200)
  img.style.position = 'absolute'
  img.style.left = `${x}px`
  img.style.top = `${y}px`
  makeDraggable(img)

  // right click to pin/unpin
  img.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    const isPinned = img.classList.toggle('pinned')
    img.style.outline = isPinned ? '3px solid white' : 'none'
    img.style.transition = isPinned ? 'none' : `opacity ${FADE_TIME}ms ease`
    if (isPinned) {
      clearTimeout(img.dataset.timerId) // pinned images stop expiring
      checkAndSpawn() // pinning opened a slot
    }
  })

  gallery.appendChild(img)
  setImgSize(img)
  float(img)
  requestAnimationFrame(() => { img.style.opacity = '1' })

  const lifespan = MIN_LIFESPAN + Math.random() * (MAX_LIFESPAN - MIN_LIFESPAN)
  img.dataset.timerId = setTimeout(() => expireImage(img, imagePath), lifespan)
}

function expireImage(img, imagePath) {
  const myFolder = currentFolder
  img.style.opacity = '0'
  setTimeout(() => {
    if (myFolder !== currentFolder) return // folder changed, bail
    img.remove()
    imageQueue.push(imagePath)
    checkAndSpawn()
  }, FADE_TIME)
}

function float(img) {
  let dirX = (Math.random() - 0.5)
  let dirY = (Math.random() - 0.5)

  function animate() {
    const speed = parseFloat(document.getElementById('floatSpeedSlider').value)
    if (!img.classList.contains('pinned') && !img.classList.contains('dragging')) {
      const x = parseFloat(img.style.left)
      const y = parseFloat(img.style.top)

      if (x <= 0 || x + img.width >= window.innerWidth) dirX *= -1
      if (y <= 0 || y + img.height >= window.innerHeight) dirY *= -1

      img.style.left = `${x + dirX * speed}px`
      img.style.top = `${y + dirY * speed}px`
    }
    requestAnimationFrame(animate)
  }
  animate()
}

function makeDraggable(img) {
  let offsetX = 0
  let offsetY = 0

  img.addEventListener('mousedown', (e) => {
    img.classList.add('dragging')
    offsetX = e.clientX - img.getBoundingClientRect().left
    offsetY = e.clientY - img.getBoundingClientRect().top
  })

  document.addEventListener('mousemove', (e) => {
    if (img.classList.contains('dragging')) {
      img.style.left = `${e.clientX - offsetX}px`
      img.style.top = `${e.clientY - offsetY}px`
    }
  })

  document.addEventListener('mouseup', () => {
    img.classList.remove('dragging')
  })
}

function setImgSize(img) {
  const selectedSize = parseInt(document.getElementById('imgSizeSlider').value)
  img.style.objectFit = 'contain'
  if (selectedSize == 1) {
    img.style.maxHeight = "200px"
    img.style.maxWidth = "125px"
  }
  if (selectedSize == 2) {
    img.style.maxHeight = "400px"
    img.style.maxWidth = "250px"
  }
  if (selectedSize == 3) {
    img.style.maxHeight = "600px"
    img.style.maxWidth = "450px"
  }
}

function menu() {
  const menuFolderBtn = document.getElementById('menuFolderSelect');
  menuFolderBtn?.addEventListener('click', pickFolder);

  const speedSlider = document.getElementById('floatSpeedSlider')
  const speedValueDisplay = document.getElementById('floatSpeedValue')
  const speedSliderVal = (speedSlider.value - speedSlider.min) / (speedSlider.max - speedSlider.min) * 100
  speedSlider.style.setProperty('--val', `${speedSliderVal}%`)
  speedValueDisplay.textContent = speedSlider.value
  speedSlider.addEventListener('input', () => {
    const speedSliderVal = (speedSlider.value - speedSlider.min) / (speedSlider.max - speedSlider.min) * 100
    speedSlider.style.setProperty('--val', `${speedSliderVal}%`)
    speedValueDisplay.textContent = speedSlider.value
  })

  const numSlider = document.getElementById('imgNumSlider')
  const numValueDisplay = document.getElementById('imgNumValue')
  const numSliderVal = (numSlider.value - numSlider.min) / (numSlider.max - numSlider.min) * 100
  numSlider.style.setProperty('--val', `${numSliderVal}%`)
  numValueDisplay.textContent = numSlider.value
  numSlider.addEventListener('input', () => {
    const numSliderVal = (numSlider.value - numSlider.min) / (numSlider.max - numSlider.min) * 100
    numSlider.style.setProperty('--val', `${numSliderVal}%`)
    numValueDisplay.textContent = numSlider.value
    checkAndSpawn()
  })

  const sizeSlider = document.getElementById('imgSizeSlider')
  const sizeValueDisplay = document.getElementById('imgSizeValue')
  const sizeSliderVal = (sizeSlider.value - sizeSlider.min) / (sizeSlider.max - sizeSlider.min) * 100
  sizeSlider.style.setProperty('--val', `${sizeSliderVal}%`)
  sizeValueDisplay.textContent = sizeSlider.value
  sizeSlider.addEventListener('input', () => {
    const sizeSliderVal = (sizeSlider.value - sizeSlider.min) / (sizeSlider.max - sizeSlider.min) * 100
    sizeSlider.style.setProperty('--val', `${sizeSliderVal}%`)
    sizeValueDisplay.textContent = sizeSlider.value
    document.querySelectorAll('.img').forEach(img => setImgSize(img))
  })
}

function main() {
  let mainFolderSelect = document.getElementById('mainFolderSelect');
  const folder = localStorage.getItem('folderPath')
  if (folder) {
    displayImages(folder);
    mainFolderSelect.style.display = 'none'
  } else {
    mainFolderSelect.style.display = 'block'
  }
  document.getElementById('mainFolderSelect')?.addEventListener('click', pickFolder)
  document.getElementById('minimizeBtn')?.addEventListener('click', () => window.api.minimize())
  document.getElementById('closeBtn')?.addEventListener('click', () => window.api.close())
  menu();
}

main()