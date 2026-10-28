import { useState } from 'react';
import { X, Upload, Check } from 'lucide-react';

interface CreateListingModalProps {
  onClose: () => void;
}

export function CreateListingModal({ onClose }: CreateListingModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    salaryMin: '',
    salaryMax: '',
    location: '',
    description: '',
  });

  const departments = ['Engineering', 'Marketing', 'HR', 'Sales', 'Design', 'Operations'];
  const locations = ['Remote', 'On-site', 'Hybrid'];

  const handleSubmit = (isDraft: boolean) => {
    console.log('Submitting form:', { ...formData, isDraft });
    onClose();
  };

  const steps = [
    { number: 1, label: 'Basic Info' },
    { number: 2, label: 'Details' },
    { number: 3, label: 'Review' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 768, boxShadow: '0 8px 40px rgba(30,41,59,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ position: 'sticky', top: 0, background: '#fff', borderBottom: '1px solid #E5E7EB', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
          <h2>Create New Job Listing</h2>
          <button
            onClick={onClose}
            style={{ padding: 8, borderRadius: 12, transition: 'background 0.2s' }}
            onMouseOver={e => (e.currentTarget.style.background = '#F4F4F9')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            {steps.map((s, idx) => (
              <div key={s.number} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      background: step >= s.number ? '#FF5F1F' : '#E5E7EB',
                      color: step >= s.number ? '#fff' : '#64748B',
                    }}
                  >
                    {step > s.number ? <Check className="w-5 h-5" /> : s.number}
                  </div>
                  <div style={{ fontSize: 14, marginTop: 8, color: '#64748B' }}>{s.label}</div>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    style={{ flex: 1, height: 4, margin: '0 16px', borderRadius: 2, transition: 'all 0.2s', background: step > s.number ? '#FF5F1F' : '#E5E7EB' }}
                  />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#374151' }}>Job Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Senior Frontend Engineer"
                  style={{ width: '100%', padding: '12px 16px', background: '#F4F4F9', border: 'none', borderRadius: 12, outline: 'none', fontSize: 16 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#374151' }}>Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', background: '#F4F4F9', border: 'none', borderRadius: 12, appearance: 'none', cursor: 'pointer', outline: 'none', fontSize: 16 }}
                >
                  <option value="">Select department...</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#374151' }}>Location Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setFormData({ ...formData, location: loc })}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 12,
                        transition: 'all 0.2s',
                        background: formData.location === loc ? '#FF5F1F' : '#F4F4F9',
                        color: formData.location === loc ? '#fff' : '#374151',
                        border: 'none',
                        fontWeight: formData.location === loc ? 600 : 400,
                        cursor: 'pointer',
                        fontSize: 16,
                      }}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, color: '#374151' }}>Salary Range (Min)</label>
                  <input
                    type="text"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                    placeholder="$80,000"
                    style={{ width: '100%', padding: '12px 16px', background: '#F4F4F9', border: 'none', borderRadius: 12, outline: 'none', fontSize: 16 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, color: '#374151' }}>Salary Range (Max)</label>
                  <input
                    type="text"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                    placeholder="$120,000"
                    style={{ width: '100%', padding: '12px 16px', background: '#F4F4F9', border: 'none', borderRadius: 12, outline: 'none', fontSize: 16 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#374151' }}>Job Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  rows={8}
                  style={{ width: '100%', padding: '12px 16px', background: '#F4F4F9', border: 'none', borderRadius: 12, resize: 'none', outline: 'none', fontSize: 16 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#374151' }}>Internal Reference Documents</label>
                <div style={{ border: '2px dashed #D1D5DB', borderRadius: 12, padding: 32, textAlign: 'center', transition: 'border 0.2s', cursor: 'pointer' }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = '#FF5F1F')}
                  onMouseOut={e => (e.currentTarget.style.borderColor = '#D1D5DB')}
                >
                  <Upload className="w-8 h-8 text-gray-400" style={{ display: 'block', margin: '0 auto 8px auto' }} />
                  <p style={{ color: '#64748B', fontSize: 14 }}>Click to upload or drag and drop</p>
                  <p style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>PDF, DOC, DOCX up to 10MB</p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ background: '#F4F4F9', borderRadius: 12, padding: 24 }}>
                <h3 style={{ marginBottom: 16 }}>Review Your Listing</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 15 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Job Title:</span>
                    <span style={{ fontWeight: 500 }}>{formData.title || 'Not provided'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Department:</span>
                    <span style={{ fontWeight: 500 }}>{formData.department || 'Not provided'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Location:</span>
                    <span style={{ fontWeight: 500 }}>{formData.location || 'Not provided'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Salary Range:</span>
                    <span style={{ fontWeight: 500 }}>
                      {formData.salaryMin && formData.salaryMax
                        ? `${formData.salaryMin} - ${formData.salaryMax}`
                        : 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>

              {formData.description && (
                <div>
                  <h4 style={{ marginBottom: 8, color: '#374151' }}>Description Preview</h4>
                  <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, fontSize: 15, color: '#374151', maxHeight: 160, overflowY: 'auto' }}>
                    {formData.description}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: '1px solid #E5E7EB' }}>
            <div>
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  style={{ padding: '12px 24px', color: '#374151', background: 'none', border: 'none', borderRadius: 12, transition: 'background 0.2s', fontSize: 16, cursor: 'pointer' }}
                  onMouseOver={e => (e.currentTarget.style.background = '#F4F4F9')}
                  onMouseOut={e => (e.currentTarget.style.background = 'none')}
                >
                  Back
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => handleSubmit(true)}
                style={{ padding: '12px 24px', border: '2px solid #FF5F1F', color: '#FF5F1F', background: 'none', borderRadius: 12, transition: 'background 0.2s', fontSize: 16, cursor: 'pointer' }}
                onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,95,31,0.05)')}
                onMouseOut={e => (e.currentTarget.style.background = 'none')}
              >
                Save as Draft
              </button>
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  style={{ padding: '12px 24px', background: '#FF5F1F', color: '#fff', border: 'none', borderRadius: 12, transition: 'background 0.2s', fontSize: 16, cursor: 'pointer', fontWeight: 500 }}
                  onMouseOver={e => (e.currentTarget.style.background = '#E55519')}
                  onMouseOut={e => (e.currentTarget.style.background = '#FF5F1F')}
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={() => handleSubmit(false)}
                  style={{ padding: '12px 24px', background: '#FF5F1F', color: '#fff', border: 'none', borderRadius: 12, transition: 'background 0.2s', fontSize: 16, cursor: 'pointer', fontWeight: 500 }}
                  onMouseOver={e => (e.currentTarget.style.background = '#E55519')}
                  onMouseOut={e => (e.currentTarget.style.background = '#FF5F1F')}
                >
                  Publish Job
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
