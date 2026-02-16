/**
 * Tests for useAccountActions hook.
 *
 * All service methods are mocked via ServiceContext.
 * Tests cover success paths, error paths, and callback invocation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useAccountActions } from '../../hooks/useAccountActions';
import { ServiceContext } from '../../contexts/ServiceContext';

// ─── Mock Services ───────────────────────────────────────────────────

const createMockUserService = () => ({
  deleteAccount: vi.fn(),
  changePassword: vi.fn(),
  changeUserId: vi.fn(),
  resetUsername: vi.fn(),
  updateProfile: vi.fn(),
});

const createWrapper = (userService) => {
  const services = { userService, financeService: {}, rankingService: {}, statsService: {} };
  return ({ children }) =>
    React.createElement(ServiceContext.Provider, { value: services }, children);
};

// ─── Helpers ─────────────────────────────────────────────────────────

let mockUserService;
let onSuccess;
let onError;
let onLogout;

beforeEach(() => {
  mockUserService = createMockUserService();
  onSuccess = vi.fn();
  onError = vi.fn();
  onLogout = vi.fn();
});

const renderAccountActions = (opts = {}) =>
  renderHook(
    () => useAccountActions({ onSuccess, onError, onLogout, ...opts }),
    { wrapper: createWrapper(mockUserService) }
  );

// ═══════════════════════════════════════════
// deleteAccount
// ═══════════════════════════════════════════

describe('deleteAccount', () => {
  it('calls onLogout on success (status 200)', async () => {
    mockUserService.deleteAccount.mockResolvedValue({ status: 200 });
    const { result } = renderAccountActions();

    await act(() => result.current.deleteAccount());

    expect(mockUserService.deleteAccount).toHaveBeenCalledOnce();
    expect(onLogout).toHaveBeenCalledOnce();
    expect(onError).not.toHaveBeenCalled();
  });

  it('calls onError when status is not 200', async () => {
    mockUserService.deleteAccount.mockResolvedValue({ status: 500 });
    const { result } = renderAccountActions();

    await act(() => result.current.deleteAccount());

    expect(onError).toHaveBeenCalledWith('deleteAccountFailed');
    expect(onLogout).not.toHaveBeenCalled();
  });

  it('calls onError on exception', async () => {
    mockUserService.deleteAccount.mockRejectedValue(new Error('Network'));
    const { result } = renderAccountActions();

    await act(() => result.current.deleteAccount());

    expect(onError).toHaveBeenCalledWith('deleteAccountError');
  });

  it('sets isLoading during operation', async () => {
    let resolvePromise;
    mockUserService.deleteAccount.mockImplementation(
      () => new Promise(r => { resolvePromise = r; })
    );
    const { result } = renderAccountActions();

    const promise = act(() => result.current.deleteAccount());
    // isLoading should be true while waiting
    expect(result.current.isLoading).toBe(true);

    await act(() => { resolvePromise({ status: 200 }); return promise; });
    expect(result.current.isLoading).toBe(false);
  });
});

// ═══════════════════════════════════════════
// changePassword
// ═══════════════════════════════════════════

describe('changePassword', () => {
  it('returns true on success', async () => {
    mockUserService.changePassword.mockResolvedValue({ status: 200 });
    const { result } = renderAccountActions();

    let returnValue;
    await act(async () => {
      returnValue = await result.current.changePassword('old', 'new', 'new');
    });

    expect(returnValue).toBe(true);
    expect(onSuccess).toHaveBeenCalledWith('passwordChanged');
  });

  it('calls onError when passwords do not match (no API call)', async () => {
    const { result } = renderAccountActions();

    let returnValue;
    await act(async () => {
      returnValue = await result.current.changePassword('old', 'new1', 'new2');
    });

    expect(returnValue).toBe(false);
    expect(onError).toHaveBeenCalledWith('passwordMismatch');
    expect(mockUserService.changePassword).not.toHaveBeenCalled();
  });

  it('calls onError when API returns non-200', async () => {
    mockUserService.changePassword.mockResolvedValue({ status: 400 });
    const { result } = renderAccountActions();

    let returnValue;
    await act(async () => {
      returnValue = await result.current.changePassword('old', 'new', 'new');
    });

    expect(returnValue).toBe(false);
    expect(onError).toHaveBeenCalledWith('changePasswordFailed');
  });

  it('calls onError on exception', async () => {
    mockUserService.changePassword.mockRejectedValue(new Error('fail'));
    const { result } = renderAccountActions();

    await act(async () => {
      await result.current.changePassword('old', 'new', 'new');
    });

    expect(onError).toHaveBeenCalledWith('changePasswordError');
  });
});

// ═══════════════════════════════════════════
// generateNewId
// ═══════════════════════════════════════════

describe('generateNewId', () => {
  it('returns the new ID on success', async () => {
    mockUserService.changeUserId.mockResolvedValue({ new_id: 'NEW123' });
    const { result } = renderAccountActions();

    let returnValue;
    await act(async () => {
      returnValue = await result.current.generateNewId('myPassword');
    });

    expect(returnValue).toBe('NEW123');
    expect(onSuccess).toHaveBeenCalledWith('idGenerated', 'NEW123');
    expect(mockUserService.changeUserId).toHaveBeenCalledWith('myPassword');
  });

  it('returns null and calls onError on failure', async () => {
    mockUserService.changeUserId.mockRejectedValue(new Error('fail'));
    const { result } = renderAccountActions();

    let returnValue;
    await act(async () => {
      returnValue = await result.current.generateNewId('pw');
    });

    expect(returnValue).toBeNull();
    expect(onError).toHaveBeenCalledWith('generateIdError');
  });
});

// ═══════════════════════════════════════════
// resetUsername
// ═══════════════════════════════════════════

describe('resetUsername', () => {
  it('returns the new username on success', async () => {
    mockUserService.resetUsername.mockResolvedValue('NewUser42');
    const { result } = renderAccountActions();

    let returnValue;
    await act(async () => {
      returnValue = await result.current.resetUsername();
    });

    expect(returnValue).toBe('NewUser42');
    expect(onSuccess).toHaveBeenCalledWith('usernameReset', 'NewUser42');
  });

  it('returns null and calls onError on exception', async () => {
    mockUserService.resetUsername.mockRejectedValue(new Error('fail'));
    const { result } = renderAccountActions();

    let returnValue;
    await act(async () => {
      returnValue = await result.current.resetUsername();
    });

    expect(returnValue).toBeNull();
    expect(onError).toHaveBeenCalledWith('resetUsernameError');
  });
});

// ═══════════════════════════════════════════
// updateProfile
// ═══════════════════════════════════════════

describe('updateProfile', () => {
  it('returns true on success', async () => {
    mockUserService.updateProfile.mockResolvedValue({ status: 200 });
    const { result } = renderAccountActions();

    let returnValue;
    await act(async () => {
      returnValue = await result.current.updateProfile({ age: 30 });
    });

    expect(returnValue).toBe(true);
    expect(onSuccess).toHaveBeenCalledWith('profileUpdated');
    expect(mockUserService.updateProfile).toHaveBeenCalledWith({ age: 30 });
  });

  it('returns false on non-200 status', async () => {
    mockUserService.updateProfile.mockResolvedValue({ status: 400 });
    const { result } = renderAccountActions();

    let returnValue;
    await act(async () => {
      returnValue = await result.current.updateProfile({ age: 30 });
    });

    expect(returnValue).toBe(false);
    expect(onError).toHaveBeenCalledWith('updateProfileFailed');
  });

  it('returns false and calls onError on exception', async () => {
    mockUserService.updateProfile.mockRejectedValue(new Error('fail'));
    const { result } = renderAccountActions();

    let returnValue;
    await act(async () => {
      returnValue = await result.current.updateProfile({});
    });

    expect(returnValue).toBe(false);
    expect(onError).toHaveBeenCalledWith('updateProfileError');
  });
});

// ═══════════════════════════════════════════
// Default callback safety
// ═══════════════════════════════════════════

describe('default callbacks', () => {
  it('does not throw when no callbacks are provided', async () => {
    mockUserService.deleteAccount.mockResolvedValue({ status: 200 });
    const { result } = renderHook(
      () => useAccountActions(),
      { wrapper: createWrapper(mockUserService) }
    );

    await expect(
      act(() => result.current.deleteAccount())
    ).resolves.not.toThrow();
  });
});
