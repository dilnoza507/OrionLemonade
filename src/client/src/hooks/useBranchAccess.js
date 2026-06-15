import { useAuthStore } from '../stores/auth';

/**
 * Returns branch access info for the current user.
 *
 * - SuperAdmin / Accountant (scope=AllBranches): full access, no filtering
 * - Director / Manager / Storekeeper (scope=OwnBranches): see only their assigned branches
 */
export function useBranchAccess() {
  const user = useAuthStore(s => s.user);

  const isAllBranches = !user || user.scope === 'AllBranches';
  const userBranchIds = (user?.branches ?? []).map(b => b.branchId);

  /** Filter a full list of active branches to only the ones the user can access. */
  function filterBranches(allBranches) {
    if (isAllBranches) return allBranches;
    return allBranches.filter(b => userBranchIds.includes(b.id));
  }

  /**
   * Returns the default value for selectedBranch state.
   * '' for unrestricted users (show all), first branch id for restricted.
   */
  function getDefaultBranchId(branches) {
    if (isAllBranches) return '';
    return branches.length > 0 ? String(branches[0].id) : '';
  }

  return { isAllBranches, userBranchIds, filterBranches, getDefaultBranchId };
}
