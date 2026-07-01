import React from 'react'
import img from './images/learn.jpg'
import './css/Home.css'

function Home() {
  return (
    <div className='home-cover'>
        <img src={img} alt="img"  />
    </div>
  )
}

export default Home