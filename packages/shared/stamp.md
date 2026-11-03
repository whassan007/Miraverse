Code format: MV-<CC><chapter>-<NNNN>-<CCCC>   e.g. MV-EG1-7K2Q-XXXX
NNNN = 4 random chars from alphabet "23456789ABCDEFGHJKMNPQRSTVWXYZ"
CCCC = checksum: FNV-1a 32-bit over UTF-8 of SALT + "EG1" + NNNN, then
       4 chars: repeat 4x { c = h % 30; out += ALPHABET[c]; h = floor(h / 30) }
SALT = "miraverse-v0"
Shown in Roblox/Minecraft on chapter completion. Redeemed on the web Passport page (stored in localStorage).
Test vectors: X7 computes 3 vectors, writes them here under "Vectors"; C6 and C8 must match them.
