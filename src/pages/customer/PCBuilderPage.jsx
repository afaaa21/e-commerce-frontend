import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { formatRupiah, getErrorMessage } from '../../utils/helpers'

const COMPONENT_ORDER = ['cpu', 'motherboard', 'ram', 'storage', 'gpu', 'psu', 'casing']
const COMPONENT_LABELS = {
  cpu: '🧠 CPU (Prosesor)',
  motherboard: '🔌 Motherboard',
  ram: '💾 RAM',
  storage: '💿 Storage (SSD/HDD)',
  gpu: '🎮 GPU (Kartu Grafis)',
  psu: '⚡ PSU (Power Supply)',
  casing: '📦 Casing',
}

export default function PCBuilderPage() {
  const navigate = useNavigate()
  const [components, setComponents] = useState({})
  const [selected, setSelected] = useState({})
  const [totalPrice, setTotalPrice] = useState(0)
  const [loadingComponents, setLoadingComponents] = useState(true)
  const [validating, setValidating] = useState(false)
  const [compatibility, setCompatibility] = useState(null)
  const [saving, setSaving] = useState(false)
  const [checkoutModal, setCheckoutModal] = useState(false)
  const [shippingAddress, setShippingAddress] = useState('')
  const [checkingOut, setCheckingOut] = useState(false)
  const [savedBuildId, setSavedBuildId] = useState(null)

  useEffect(() => {
    fetchComponents()
  }, [])

  useEffect(() => {
    const total = Object.values(selected).reduce((acc, item) => {
      if (!item) return acc
      return acc + Number(item.price)
    }, 0)
    setTotalPrice(total)
    setCompatibility(null)
  }, [selected])

  const fetchComponents = async (cpuId = null) => {
    setLoadingComponents(true)
    try {
      const url = cpuId ? `/builder/components?cpu_id=${cpuId}` : '/builder/components'
      const res = await api.get(url)
      setComponents(res.data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoadingComponents(false)
    }
  }

  const handleSelectComponent = (type, product) => {
    const newSelected = { ...selected, [type]: product }

    if (type === 'cpu') {
      const newState = { cpu: product }
      setSelected(newState)
      setCompatibility(null)
      setSavedBuildId(null)
      fetchComponents(product.id)
    } else {
      setSelected(newSelected)
    }
  }

  const handleRemoveComponent = (type) => {
    const newSelected = { ...selected }
    delete newSelected[type]
    setSelected(newSelected)
    if (type === 'cpu') {
      setSelected({})
      fetchComponents()
    }
  }

  const handleValidate = async () => {
    if (!selected.cpu) {
      toast.error('Pilih CPU terlebih dahulu')
      return
    }
    setValidating(true)
    try {
      const payload = {}
      if (selected.cpu) payload.cpu_id = selected.cpu.id
      if (selected.motherboard) payload.motherboard_id = selected.motherboard.id
      if (selected.ram) payload.ram_id = selected.ram.id
      if (selected.storage) payload.storage_id = selected.storage.id
      if (selected.gpu) payload.gpu_id = selected.gpu.id
      if (selected.psu) payload.psu_id = selected.psu.id
      if (selected.casing) payload.casing_id = selected.casing.id

      const res = await api.post('/builder/validate', payload)
      setCompatibility(res.data)
      if (res.data.compatible) {
        toast.success(res.data.message || 'Komponen kompatibel!')
      } else {
        toast.error(res.data.message || 'Komponen tidak kompatibel')
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setValidating(false)
    }
  }

  const handleSaveBuild = async () => {
    if (!selected.cpu) {
      toast.error('Minimal pilih CPU terlebih dahulu')
      return
    }
    setSaving(true)
    try {
      const payload = {}
      if (selected.cpu) payload.cpu_id = selected.cpu.id
      if (selected.motherboard) payload.motherboard_id = selected.motherboard.id
      if (selected.ram) payload.ram_id = selected.ram.id
      if (selected.storage) payload.storage_id = selected.storage.id
      if (selected.gpu) payload.gpu_id = selected.gpu.id
      if (selected.psu) payload.psu_id = selected.psu.id
      if (selected.casing) payload.casing_id = selected.casing.id

      const res = await api.post('/builder', payload)
      setSavedBuildId(res.data.id || res.data.build?.id)
      toast.success('Build PC berhasil disimpan!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      toast.error('Alamat pengiriman wajib diisi')
      return
    }
    if (!savedBuildId) {
      toast.error('Simpan build terlebih dahulu sebelum checkout')
      return
    }
    setCheckingOut(true)
    try {
      await api.post('/builder/checkout', {
        build_id: savedBuildId,
        shipping_address: shippingAddress,
      })
      toast.success('Pesanan PC berhasil dibuat!')
      setCheckoutModal(false)
      navigate('/orders')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setCheckingOut(false)
    }
  }

  const availableComponents = COMPONENT_ORDER.filter(type => {
    if (type === 'cpu') return true
    return selected.cpu && components[type]?.length > 0
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🔧 PC Builder</h1>
        <p className="text-gray-500 mt-1">Rakit PC impian Anda dengan komponen yang kompatibel</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {!selected.cpu && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-700 text-sm">
              💡 Mulai dengan memilih CPU. Sistem akan menampilkan komponen yang kompatibel secara otomatis.
            </div>
          )}

          {COMPONENT_ORDER.map((type) => {
            const isLocked = type !== 'cpu' && !selected.cpu
            const componentList = components[type] || []
            const selectedItem = selected[type]

            return (
              <div key={type} className={`bg-white rounded-xl shadow-sm border ${isLocked ? 'border-gray-100 opacity-50' : 'border-gray-200'} overflow-hidden`}>
                <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">{COMPONENT_LABELS[type]}</h3>
                  {isLocked && <span className="text-xs text-gray-400">🔒 Pilih CPU dahulu</span>}
                  {selectedItem && (
                    <button onClick={() => handleRemoveComponent(type)}
                      className="text-xs text-red-500 hover:text-red-700">✕ Hapus</button>
                  )}
                </div>

                {selectedItem ? (
                  <div className="p-4 flex items-center gap-4 bg-green-50">
                    <span className="text-2xl">✅</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{selectedItem.name}</p>
                      <p className="text-blue-600 font-bold">{formatRupiah(selectedItem.price)}</p>
                    </div>
                  </div>
                ) : !isLocked && (
                  <div className="p-4">
                    {loadingComponents && type !== 'cpu' ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                      </div>
                    ) : componentList.length === 0 ? (
                      <p className="text-center text-gray-400 py-4 text-sm">Tidak ada komponen tersedia</p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {componentList.map(item => (
                          <button
                            key={item.id}
                            onClick={() => handleSelectComponent(type, item)}
                            className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                          >
                            <div>
                              <p className="font-medium text-gray-800">{item.name}</p>
                              {item.specs && (
                                <p className="text-xs text-gray-500">
                                  {Object.entries(item.specs).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                                </p>
                              )}
                            </div>
                            <span className="text-blue-600 font-bold ml-4 whitespace-nowrap">{formatRupiah(item.price)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-4">
            <h2 className="font-bold text-gray-900 text-lg mb-4">📋 Ringkasan Build</h2>

            <div className="space-y-2 mb-4">
              {COMPONENT_ORDER.map(type => (
                <div key={type} className="flex justify-between items-center text-sm py-1 border-b border-gray-50">
                  <span className="text-gray-500">{COMPONENT_LABELS[type].split(' ').slice(1).join(' ')}</span>
                  {selected[type] ? (
                    <span className="font-medium text-gray-800 text-right max-w-32 truncate">
                      {formatRupiah(selected[type].price)}
                    </span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </div>
              ))}
            </div>

            <div className="py-3 border-t border-gray-200 flex justify-between items-center">
              <span className="font-semibold text-gray-700">Total Estimasi</span>
              <span className="text-xl font-bold text-blue-600">{formatRupiah(totalPrice)}</span>
            </div>

            {compatibility && (
              <div className={`mt-3 p-3 rounded-lg text-sm font-medium ${compatibility.compatible ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {compatibility.compatible ? '✅' : '❌'} {compatibility.message}
              </div>
            )}

            <div className="mt-4 space-y-2">
              <button
                onClick={handleValidate}
                disabled={validating || !selected.cpu}
                className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-40 font-semibold py-2.5 rounded-lg transition-colors"
              >
                {validating ? 'Memeriksa...' : '🔍 Cek Kompatibilitas'}
              </button>

              <button
                onClick={handleSaveBuild}
                disabled={saving || !selected.cpu}
                className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 font-semibold py-2.5 rounded-lg transition-colors"
              >
                {saving ? 'Menyimpan...' : '💾 Simpan Build'}
              </button>

              <button
                onClick={() => {
                  if (!savedBuildId) {
                    toast.error('Simpan build terlebih dahulu')
                    return
                  }
                  setCheckoutModal(true)
                }}
                disabled={!selected.cpu}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                🛒 Checkout Build
              </button>
            </div>

            {Object.keys(selected).length > 0 && (
              <button
                onClick={() => { setSelected({}); setCompatibility(null); setSavedBuildId(null); fetchComponents() }}
                className="w-full mt-2 text-xs text-red-500 hover:text-red-700"
              >
                Reset semua komponen
              </button>
            )}
          </div>
        </div>
      </div>

      {checkoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Checkout PC Build</h2>
            <p className="text-gray-500 text-sm mb-4">Total: <span className="font-bold text-blue-600">{formatRupiah(totalPrice)}</span></p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Pengiriman *</label>
              <textarea
                value={shippingAddress}
                onChange={e => setShippingAddress(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan alamat lengkap pengiriman..."
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCheckoutModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleCheckout} disabled={checkingOut}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg transition-colors">
                {checkingOut ? 'Memproses...' : 'Buat Pesanan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
