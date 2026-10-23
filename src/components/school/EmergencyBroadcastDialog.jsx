import { useState } from 'react'
import { AUDIENCES } from '../../campus-update/data/metrics.js'
import { Icon } from '../../campus-update/components/Icons.jsx'
import { Modal } from '../../campus-update/components/Modal.jsx'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        try {
          const scale = Math.min(1, 1280 / Math.max(image.width, image.height))
          const canvas = document.createElement('canvas')
          canvas.width = Math.max(1, Math.round(image.width * scale))
          canvas.height = Math.max(1, Math.round(image.height * scale))
          const context = canvas.getContext('2d')
          if (!context) throw new Error('Could not process this image. Try another file.')
          context.drawImage(image, 0, 0, canvas.width, canvas.height)
          resolve({ name: file.name, src: canvas.toDataURL('image/jpeg', 0.75) })
        } catch {
          reject(new Error('Could not process this image. Try another file.'))
        }
      }
      image.onerror = () => reject(new Error('Could not read this image. Try another file.'))
      if (typeof reader.result !== 'string') {
        reject(new Error('Could not read this image. Try another file.'))
        return
      }
      image.src = reader.result
    }
    reader.onerror = () => reject(new Error('Could not read this image. Try another file.'))
    reader.readAsDataURL(file)
  })
}

export default function EmergencyBroadcastDialog({ institutionName, onClose, onSend }) {
  const [stage, setStage] = useState('compose')
  const [title, setTitle] = useState('')
  const [audience, setAudience] = useState('')
  const [message, setMessage] = useState('')
  const [image, setImage] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const selectImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Choose a JPG or PNG image.')
      event.target.value = ''
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError('Image must be 5MB or smaller.')
      event.target.value = ''
      return
    }
    try {
      setImage(await readImage(file))
      setError('')
    } catch (readError) {
      setError(readError.message)
      event.target.value = ''
    }
  }

  const continueToConfirmation = (event) => {
    event.preventDefault()
    if (title.trim().length < 3) {
      setError('Enter an alert headline of at least 3 characters.')
      return
    }
    if (!audience) {
      setError('Select an audience for this alert.')
      return
    }
    if (message.trim().length < 10) {
      setError('Write an alert message of at least 10 characters.')
      return
    }
    setError('')
    setStage('confirm')
  }

  const send = async () => {
    setSaving(true)
    try {
      await onSend({
        title: title.trim(),
        audience,
        message: message.trim(),
        imageUrl: image?.src || null,
        sentAt: new Date().toISOString(),
      })
      setStage('success')
    } catch (sendError) {
      setError(sendError.message || 'Could not send the emergency alert. Try again.')
      setStage('compose')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="source-page">
      {stage === 'compose' && (
        <Modal title="Broadcast Emergency Alert" onClose={onClose} size="emergency-compose">
          <form onSubmit={continueToConfirmation} noValidate>
            <div className="modal-b emergency-compose-body">
              <p className="emergency-subtitle">They can publish only for {institutionName}.</p>
              <label className="emergency-field">
                <span>Article Headline <b>*</b></span>
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Enter alert headline" autoComplete="off" />
              </label>
              <label className="emergency-field">
                <span>Audience <b>*</b></span>
                <select value={audience} onChange={(event) => setAudience(event.target.value)}>
                  <option value="">Select audience</option>
                  {AUDIENCES.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <div className="emergency-field">
                <label htmlFor="emergency-message">Message <b>*</b></label>
                <div className="emergency-message">
                  <div className="emergency-format" aria-hidden="true">
                    <b>B</b><i>I</i><Icon n="link" s={15} /><Icon n="list" s={16} />
                  </div>
                  <textarea id="emergency-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write full alert message..." rows={6} />
                </div>
              </div>
              <input className="sr-only" id="emergency-image" type="file" accept="image/jpeg,image/png" onChange={selectImage} />
              {image ? (
                <div className="emergency-image-preview">
                  <img src={image.src} alt="" />
                  <span>{image.name}</span>
                  <button type="button" onClick={() => setImage(null)}>Remove image</button>
                </div>
              ) : (
                <label className="emergency-upload" htmlFor="emergency-image">
                  <span><Icon n="upload" s={18} /></span>
                  <b>Upload your image here</b>
                  <small>Supports JPG or PNG. Max file size 5MB.</small>
                </label>
              )}
              {error && <p className="emergency-error" role="alert">{error}</p>}
            </div>
            <div className="modal-f emergency-compose-actions">
              <button type="button" className="btn btn-line" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-danger"><Icon n="mega" s={15} />Send broadcast</button>
            </div>
          </form>
        </Modal>
      )}
      {stage === 'confirm' && (
        <Modal title="Confirm emergency broadcast" onClose={onClose} size="emergency-confirm">
          <div className="emergency-confirm-content">
            <span className="emergency-confirm-icon"><Icon n="warning" s={42} /></span>
            <h2>Are you sure you want to proceed?</h2>
            <p>This emergency broadcast will be sent to {institutionName} for <b>{audience}</b>.</p>
          </div>
          <div className="modal-f emergency-confirm-actions">
            <button type="button" className="btn btn-line" onClick={() => setStage('compose')}>Cancel</button>
            <button type="button" className="btn btn-solid" onClick={send} disabled={saving}>
              {saving ? 'Sending...' : <>Proceed <Icon n="send" s={15} /></>}
            </button>
          </div>
        </Modal>
      )}
      {stage === 'success' && (
        <Modal title="Emergency broadcast sent" onClose={onClose} size="emergency-confirm">
          <div className="emergency-confirm-content">
            <span className="emergency-success-icon"><Icon n="check" s={42} /></span>
            <h2>Emergency broadcast has been sent successfully</h2>
            <p>This emergency broadcast has been recorded for {institutionName}.</p>
          </div>
          <div className="modal-f emergency-confirm-actions">
            <button type="button" className="btn btn-line" onClick={onClose}>Close</button>
            <button type="button" className="btn btn-solid" onClick={onClose}>Back to dashboard</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
