import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HomePage } from './index'

// Mock the auth hook
vi.mock('../shared/lib/auth', () => ({
  useSession: vi.fn().mockReturnValue({
    data: null,
    isPending: false,
    error: null,
  }),
}))

describe('HomePage', () => {
  it('should render the welcome message', async () => {
    render(<HomePage />)

    // Wait for loading to finish
    expect(await screen.findByText('Selamat datang di aplikasi silsilah keluarga')).toBeInTheDocument()
  })

  it('should render the header', () => {
    render(<HomePage />)

    expect(screen.getByText('Raktamarga')).toBeInTheDocument()
    expect(screen.getByText('Silsilah Keluarga')).toBeInTheDocument()
  })
})
