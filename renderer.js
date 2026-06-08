

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const IMAGES_PER_SET = parseInt(document.getElementById('imgNumSlider').value) //number of images
const HOLD_TIME = 45000; // how long each set of images stays visible before fading out
const FADE_TIME = 2000;// how long fade takes
let currentFolder = null

async function pickFolder() {
  const folder = await window.api.pickFolder()
  if (folder) {
    localStorage.setItem('folderPath', folder)
    displayImages(folder)
  }
}

async function displayImages(folder) {
   currentFolder = folder
  const myFolder = folder

  const images = await window.api.getImages(folder)
  const gallery = document.getElementById('gallery')
  const sets = []
  for (let i = 0; i < images.length; i += IMAGES_PER_SET) {
    sets.push(images.slice(i, i + IMAGES_PER_SET))
  }

  for (const set of sets) {
    if (myFolder !== currentFolder) return  // ← stop if folder changed

    const existing = document.querySelectorAll('.img:not(.pinned)')
    existing.forEach(img => img.style.opacity = '0')
    if (existing.length > 0) await sleep(FADE_TIME)

    document.querySelectorAll('.img:not(.pinned)').forEach(img => img.remove())

    set.forEach((imagePath) => {
      const img = document.createElement('img')
      img.draggable = true
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
      })

      gallery.appendChild(img)
      setImgSize(img)
      float(img)
    })

    await sleep(50)
    document.querySelectorAll('.img').forEach(img => img.style.opacity = '1')
    await sleep(HOLD_TIME)
  }
}
function float(img) {
  let dirX = (Math.random() - 0.5)
  let dirY = (Math.random() - 0.5)

  function animate() {
    const speed = parseFloat(document.getElementById('floatSpeedSlider').value)
    if (!img.classList.contains('pinned')) {
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
  let isDragging = false
  let offsetX = 0
  let offsetY = 0

  img.addEventListener('mousedown', (e) => {
    isDragging = true
    offsetX = e.clientX - img.getBoundingClientRect().left
    offsetY = e.clientY - img.getBoundingClientRect().top
  })

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    img.style.left = `${e.clientX - offsetX}px`
    img.style.top = `${e.clientY - offsetY}px`
  })

  document.addEventListener('mouseup', () => {
    isDragging = false
  })
}
function setImgSize(img){
  const selectedSize = parseInt(document.getElementById('imgSizeSlider').value)
  if(selectedSize ==1)
  {
    img.style.height = "200px"
    img.style.width = "125px"

  }
  if(selectedSize == 2)
  {
    img.style.height = "400px"
    img.style.width = "250px"
  }
  if (selectedSize == 3)
  {
    img.style.height = "800px"
    img.style.width = "500px"
  }
  

}
function menu() {
  const menuFolderBtn = document.getElementById('menuFolderSelect');
  menuFolderBtn?.addEventListener('click', pickFolder);

  const speedSlider = document.getElementById('floatSpeedSlider')
  const speedSliderVal = (speedSlider.value - speedSlider.min) / (speedSlider.max - speedSlider.min) * 100
  speedSlider.style.setProperty('--val', `${speedSliderVal}%`)
  speedSlider.addEventListener('input', () => {
  const speedSliderVal = (speedSlider.value - speedSlider.min) / (speedSlider.max - speedSlider.min) * 100
  speedSlider.style.setProperty('--val', `${speedSliderVal}%`)})

  const numSlider = document.getElementById('imgNumSlider')
  const numSliderVal = (numSlider.value - numSlider.min) / (numSlider.max - numSlider.min) * 100
  numSlider.style.setProperty('--val', `${numSliderVal}%`)
  numSlider.addEventListener('input', () => {
  const numSliderVal = (numSlider.value - numSlider.min) / (numSlider.max - numSlider.min) * 100
  numSlider.style.setProperty('--val', `${numSliderVal}%`)})

  const sizeSlider = document.getElementById('imgSizeSlider')
  const sizeSliderVal = (sizeSlider.value - sizeSlider.min) / (sizeSlider.max - sizeSlider.min) * 100
  sizeSlider.style.setProperty('--val', `${sizeSliderVal}%`)
  sizeSlider.addEventListener('input', () => {
  const sizeSliderVal = (sizeSlider.value - sizeSlider.min) / (sizeSlider.max - sizeSlider.min) * 100
  sizeSlider.style.setProperty('--val', `${sizeSliderVal}%`)
  document.querySelectorAll('.img').forEach(img => setImgSize(img)) // add this line
})
}

function main() {
  let mainFolderSelect = document.getElementById('mainFolderSelect');
  const folder = localStorage.getItem('folderPath')
  if (folder) {
    displayImages(folder);
    mainFolderSelect.style.display = 'none' // hide the button
  } else {
    mainFolderSelect.style.display = 'block' // show the button
  }
  document.getElementById('mainFolderSelect')?.addEventListener('click', pickFolder)
  document.getElementById('minimizeBtn')?.addEventListener('click', () => window.api.minimize())
  document.getElementById('closeBtn')?.addEventListener('click', () => window.api.close())
  menu();
}

main()
