# Creator Runbook: Roblox Avatar Marketplace & Official Community Moderation (`DX15` Section 8A)

1. **Marketplace Submission Gate:** Never auto-submit or spend Robux fees in CI. Creator reviews `art/v06/characters/avatar-marketplace/collection-manifest.json` in Roblox Studio Avatar Setup, previews on R15 rigs, and approves fee payment manually in Creator Hub.
2. **Moderation Rejection / Unlisting:** If an item is rejected or requires revision, keep its status in `SocialAvatarContracts.CATALOG` as `experience_only` or `rejected` and never expose unverified Asset IDs on the website.
3. **Official Community Safety:** Disable open unmoderated group wall posts; restrict announcements to verified creator accounts; never require group membership for quest progression.
