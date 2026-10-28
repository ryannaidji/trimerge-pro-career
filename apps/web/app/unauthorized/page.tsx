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
                height: '60vh',
                width: '80vw',            
                backgroundColor: '#8FAFC',
                borderTopRightRadius: '0.8rem',
                borderBottomRightRadius: '0.8rem',
                display: 'flex',
                alignItems: 'start',
                justifyContent: 'start',
                paddingTop: '3rem',
                paddingLeft: '1rem',
                position: 'relative',
                border: '2px solid #F59E0B',
                paddingRight: '9rem',
            }}>
            <span style={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', width: '80%', alignItems: 'center' }}>

                <span style={{ display: "flex", flexDirection: "column", fontWeight: 'bold', textAlign: 'left' }}>
                    <h1 style={{ fontSize: '2rem'}}>
                        Access Restricted
                    </h1>
                    <h1 style={{ fontSize: '1rem', width: '60%', marginTop: '2rem' }}>
                        You do not have permission to view this page. Please return to your dashboard or contact your administrator if you believe this is an error.
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
                <span style={{ display: 'flex', width: '100%', justifyContent: 'space-between', paddingRight: '9rem' }}>
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
                        Return to Dashboard
                    </button>
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
                        Contact Support
                    </button>
                </span>
                </span>
                <img
                    src="/unauthorized.png"
                    alt="Unauthorized Illustration"
                    width={300}
                    height={200}

                />
            </div>
                    
    </div>
  )
}

export default Page