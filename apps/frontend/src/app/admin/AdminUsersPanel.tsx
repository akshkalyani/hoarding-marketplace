'use client';

import { useState } from 'react';
import { usePendingUsers, useApproveUser, useRejectUser } from '@/hooks/useAdmin';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import type { User } from '@/lib/types';
import { format } from 'date-fns';

export default function AdminUsersPanel() {
  const { data: users, isLoading } = usePendingUsers();
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleReject = () => {
    if (!rejectModal) return;
    rejectUser.mutate(
      { id: rejectModal.id, reason: rejectReason || undefined },
      { onSuccess: () => { setRejectModal(null); setRejectReason(''); } }
    );
  };

  if (isLoading) {
    return <div className="text-gray-500">Loading pending users...</div>;
  }

  if (!users?.length) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500">No pending users to review.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Phone</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Joined</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: User) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{user.name}</td>
                <td className="py-3 px-4 text-gray-500">{user.email}</td>
                <td className="py-3 px-4 text-gray-500">{user.phone || '—'}</td>
                <td className="py-3 px-4 text-gray-500">{format(new Date(user.createdAt), 'MMM d, yyyy')}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      onClick={() => approveUser.mutate(user.id)}
                      loading={approveUser.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setRejectModal({ id: user.id, name: user.name })}
                    >
                      Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title={`Reject ${rejectModal?.name || 'User'}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Provide a reason for rejection (optional):</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Reason..."
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} loading={rejectUser.isPending}>Reject</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
