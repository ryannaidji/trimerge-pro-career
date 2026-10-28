import Image from 'next/image'
import React from 'react'

function Page() {
  return (
    <div style={{
        minHeight: '86vh',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingBottom: '2rem',
        columnGap: '4rem',
    }}>
        <div style={{
            height: '50vh',
            width: '50vw',            
            backgroundColor: '#0b1f3a',
            borderTopRightRadius: '0.8rem',
            borderBottomRightRadius: '0.8rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'start',
            justifyContent: 'start',
            paddingTop: '3rem',
            paddingLeft: '3rem',
            position: 'relative',
        }}>
            <span style={{ fontSize: '2rem', display: "flex", flexDirection: "column", fontWeight: 'bold', color: 'white', textAlign: 'left' }}>
                <h1>
                    Your session has expired due to inactivity. 
                </h1>
                <h1>
                    Please sign in again.
                </h1>
            </span>
            <div style={{
                fontSize: '1rem',
                color: 'white',
                textAlign: 'center',
                width: '80%',
                textAlignLast: 'center',
                marginTop: '1rem',
            }}>
                For security purposes, users are automatically logged out after 10 minutes of inactivity.
            </div>
                <button style={{
                    backgroundColor: '#1e3a8a',
                    color: 'white',
                    width: '45%',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '4rem'
                }}>
                    Sign in
                </button>
        </div>
          <Image
            src="logout.svg"
            alt="Success Illustration"
            width={500}
            height={200}

        />
                
    </div>
  )
}

export default Page