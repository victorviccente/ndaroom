import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import NDARoom from './pages/NdaRoom'



function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
       <NDARoom/>
      </div>
      
    </>
  )
}

export default App
