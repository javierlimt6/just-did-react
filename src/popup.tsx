import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
// grab your mounting point
const container = document.getElementById('root')!

// create the root and render with StrictMode
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <ChakraProvider value={defaultSystem}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
)

// after render, resize the popup to fit + enforce aspect/min/max
setTimeout(() => {
  const { width: w0, height: h0 } = container.getBoundingClientRect()
  const minRatio = 0.8, maxW = 600, maxH = 800
  let width = w0, height = h0

  if (height < width * minRatio) height = width * minRatio
  else if (width < height * minRatio) width = height * minRatio

  width = Math.min(width, maxW)
  height = Math.min(height, maxH)

  window.resizeTo(Math.ceil(width), Math.ceil(height))
  console.log(`Popup resized to ${width}x${height}`)
}, 0)