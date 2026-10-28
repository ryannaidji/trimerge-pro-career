import Image from 'next/image'
import React from 'react'

export default function Page() {
  return (
    <div style={{ padding: '2rem', backgroundColor: '#f0f0f0', height: '85vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{width: '80%', height: '90%', backgroundColor: '#0b1f3a', padding: '2rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'start', rowGap: '1rem', position: 'relative', maxWidth: '1100px', maxHeight: '600px'}}>
                    <form style={{width: '100%'}}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                Change Password
            </h1>
            <span style={{ display: 'flex', flexDirection: 'column', rowGap: '1.5rem', width: '100%', marginTop: '3rem'}}>
                <input type="password" placeholder="Current Password *" style={{
                    padding: '0.75rem',
                    border: '1px solid #D1D5DB',
                    width: '50%',
                    backgroundColor: 'white',
                    borderRadius: '0.375rem',
                }} />
                <input type="password" placeholder="New Password *" style={{
                    padding: '0.75rem',
                    border: '1px solid #D1D5DB',
                    width: '50%',
                    backgroundColor: 'white',
                    borderRadius: '0.375rem',
                }} />
                <input type="password" placeholder="Confirm New Password *" style={{
                    padding: '0.75rem',
                    border: '1px solid #D1D5DB',
                    width: '50%',
                    backgroundColor: 'white',
                    borderRadius: '0.375rem',
                }} />
            </span>
            <span style={{ display: 'flex', width: '50%', justifyContent: 'space-between', marginTop: '3rem'}}>
                <button style={{
                    backgroundColor: '#1e3a8a',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '0.375rem',
                }} >
                    Save Changes
                </button>
                <button style={{
                    backgroundColor: '#1e3a8a',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '0.375rem',
                }} >
                    Cancel
                </button>
            </span>
                    </form>
                    <Image
                        src="/forgot.svg"
                        alt="Forgot Illustration"
                        width={500}
                        height={200}
                        style={{
                            position: 'absolute',
                            bottom: '-8%',
                            right: '-6%',
                            zIndex: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                        }}
                    />
                </div>
    </div>
  )
}
