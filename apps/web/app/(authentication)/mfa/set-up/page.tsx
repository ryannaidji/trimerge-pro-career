'use client'


import Image from 'next/image'
import React from 'react'


type States = "PHONE_VERIFICATION" | "EMAIL_VERIFICATION" | "AUTHENTICATOR_APP"

function Page() {
  return (  
    <div style={{
        minHeight: '90vh',
        display: 'flex',
        position: 'relative',
        flexDirection: 'column',
        backgroundColor: 'white',
        padding: '2rem',
        rowGap: '1rem',
        alignItems: 'center',
        justifyContent: 'end',
    }}>
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            bottom: '0%',
            paddingTop: '2rem',
            width: '80%',
            height: '90%',
            borderTopLeftRadius: '0.5rem',
            borderTopRightRadius: '0.5rem',
            border: '2px solid #f5a929',
            borderBottom: 'none',
            alignItems: 'center',
            justifyContent: 'start ',
            backgroundColor: '#0b1f3a',
        }}>
          
            <div style={{
                color: 'white',
                fontSize: '2rem',
                fontWeight: 'bold',
                textAlign: 'center',
                marginTop: '2rem',
                width: '70%',
                textAlignLast: 'center',
            }}>
                Choose a Verification Method
            </div>
            <Image
            src="/secure.svg"
            width={100}
            height={200}
            alt="MFA Image"
             style={{
                 marginBottom: '2rem',
                 marginTop: '1rem',
             }}
            />
            
            <button style={{
                backgroundColor: 'white',
                color: 'black',
                border: '2px solid #f5a929',
                padding: '0.75rem 1.5rem', 
                borderRadius: '0.375rem',
                cursor: 'pointer',
                marginTop: '2rem',
                width: '40%',
            }}>
                Receive SMS Text Message
            </button>   
            <button style={{
                backgroundColor: 'white',
                color: 'black',
                border: '2px solid #f5a929',
                padding: '0.75rem 1.5rem', 
                borderRadius: '0.375rem',
                cursor: 'pointer',
                marginTop: '2rem',
                width: '40%',
            }}>
                Receive Email Verification Code
            </button>   
            <button style={{
                backgroundColor: 'white',
                color: 'black',
                border: '2px solid #f5a929',
                padding: '0.75rem 1.5rem', 
                borderRadius: '0.375rem',
                cursor: 'pointer',
                marginTop: '2rem',
                width: '40%',
            }}>
                Authenticator App
            </button>   
            <button style={{
                backgroundColor: '#1e3a8a',
                color: 'white',
                padding: '0.75rem 1.5rem', 
                borderRadius: '0.375rem',
                cursor: 'pointer',
                marginTop: '2rem',
            }}>
                Back to Dashboard
            </button>   
        </div>
        

    </div>
  )
}

export default Page