'use client'
import React from 'react'
import useUser from '../hooks/useUser'



const page = () => {
  const {user} = useUser();
    console.log(user);
  return (
    
    <div>Home Page</div>
  )
}

export default page