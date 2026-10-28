import Image from 'next/image'
import React from 'react'

function Page() {
  return (
    <div style={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
        }}>
            <div style={{
                position: 'relative',
                width: '50%',
                maxWidth: '70rem',
            }}>
                <form style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #f5a929',  
                    rowGap: '1rem',
                    paddingBottom: '7rem',
                    position: 'relative',
                    zIndex: 1
                }}>
                <img 
                src="/Logo.png" 
                alt="TriMergePro Logo" 
                style={{ 
                    objectFit: 'contain', 
                    height: '6rem', 
                    width: '300px',
                    marginBottom: '3rem' 
                }} 
                />
                <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#111827', textAlign: 'center' }}>
                    Secure your Account
                </h1>
                <div style={{
                     textAlign: 'center', 
                     fontSize: '1.25rem', 
                     fontWeight: 'bold', 
                     color: '#4b5563',
                     width: '90%',}}>
                    Add an extra layer of security to your TriMergePRO account by setting up multi-factor authentication.
                </div>
                <button style={{
                    backgroundColor: '#1e3a8a',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '1rem',
                    width: '3   0%'
                }}>
                    Set up MFA
                </button>
                <button style={{
                    backgroundColor: '#1e3a8a',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '1rem',
                    width: '3   0%'
                }}>
                    Skip for Now
                </button>
                </form>
                <Image
                    src= "mfa.svg"
                    width={500}
                    height={200}
                    alt= "MFA Image"
                    style={{
                        objectFit: 'contain',
                        height: '17rem',
                    width: '350px',
                    marginBottom: '1rem',
                    position: 'absolute',
                    bottom: '-4%',
                    left: '-15%',
                    zIndex: 10,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    }}
                />
            </div>
    </div>
  )
}

export default Page