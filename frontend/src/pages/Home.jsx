import React from 'react'
import Carousel from '../components/Carousel'
import BlogDisplay from '../components/BlogDisplay'
import Welcome from '../components/Welcome'
import What from '../components/What'
import Services from '../components/Services'

const Home = () => {
  return (
    <div>
        
        <Carousel/>
        <Welcome/>
        <What/>
        <BlogDisplay/>
        <Services/>
    </div>
  )
}

export default Home