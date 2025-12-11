import type { LocationQuery, LocationQueryRaw } from 'vue-router';
import JSEncrypt from 'jsencrypt';
const PUBLIC_KEY = `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3NmujPVOafessxYOwvhW
  iF9inFmuUXgfWPtOvtfixLYOWdcGHOWZZDB7nbRddbruCmpN6zRt4JkGBxVfscjQ
  xIyznK5dAC/8fFIAc1gdleANwf9382HaMx/aGxmrLzYLJ/5lQU7ES7n+LeuaGZRE
  Djgb8ERXSgwrusCDvVYpSHTbgS0lHtrQdqt5AhpKtgvOB+ABqCI26iAukb9b8J+y
  sNP3vN+o2nRo/q9XGAQfmP+R+qffZCNSDEOlZUEcka3OPrliruP30pUQjTxaBL7r
  XCcnrkzaZAjlm4UABDce1uTmZ7wc4Q7HnMmV4IcmqgCiZ6I54vu4EFR6HJhbXiC6
  nwIDAQAB`;

const priviate = `
  MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDc2a6M9U5p96yz
Fg7C+FaIX2KcWa5ReB9Y+06+1+LEtg5Z1wYc5ZlkMHudtF11uu4Kak3rNG3gmQYH
FV+xyNDEjLOcrl0AL/x8UgBzWB2V4A3B/3fzYdozH9obGasvNgsn/mVBTsRLuf4t
65oZlEQOOBvwRFdKDCu6wIO9VilIdNuBLSUe2tB2q3kCGkq2C84H4AGoIjbqIC6R
v1vwn7Kw0/e836jadGj+r1cYBB+Y/5H6p99kI1IMQ6VlQRyRrc4+uWKu4/fSlRCN
PFoEvutcJyeuTNpkCOWbhQAENx7W5OZnvBzhDsecyZXghyaqAKJnojni+7gQVHoc
mFteILqfAgMBAAECggEAXeJcBagykXGshOUXmWKgxpBmBzlIlXGPQfBzZUW5LQ6H
w0FZY+dm8eR6aGxIXsf8cYkHXrmHDDeBDHnVmGpZ9XQq1qx49J9xohfqAR6wVQpO
Tu4fO+OZMqqTuXmMACHlVDcdLEojwF1s5HCHreANnk3T8qvav6u020sDtfVuz1Gz
hOhVA7hbKbPCbg9n0An7HtyXCXNCMGNQ1y0Nyl/vjkLfSMN+TeN4UeemWobO6J5u
M5vZVnMA6pDMjIDk6iLp/swGLN7yyGSkb4tZZS9w6+jNMRXHFLeZK3fpCggLnCi9
yt9JQo46HEErcVjPTn6NhTtqDcJcEIZvHww/9NKKwQKBgQD8t1vAzm7e87nCgHiC
YLSFx2prkX5oK3EPtb845lyBiZoEGdmz2abwuOmTV6BMb3dvAJI2Qcr4nl2Ay7l1
7CgUuRRKa93BBNsNb3KU2und0M0e+JJgl23zaTqHRGvhpHqMfHqe7yhQzXsiZjHT
0R3OWjddumjE1rxEFbIq56n5BwKBgQDfuFLmR7K1GpG+bcRs7aNWIzRwSQwDDP7e
OIhhKWDV8YE0smXu9mvdTMsErY+De3JjbUGvSbTxB7Qp/aNHIPKqeTP9dYP+WoqE
TycCbe6UEwk8aDiePMtV2S+1j6vfLNy3K6Qa32rG1v6x8EdG8eY1rRw13f5xO2jM
0edpUC3DqQKBgQDpEcojRb/nC2z0vztlMv8KqmGxl1u3gukhDgOv3HTQWzGaOqUX
Q9K9DC0PYK9MDzldPG+cbo1dQeEGWd1Prl9AzXizMkwwKeREvdY1BrjNhDbJK4ME
ZmRXK2N5QVcloWYMjvkf/311GC1KCmpF6gTNPVL2tGbPsyOqvz+0ZjfSnQKBgQCx
afcz7z/lJwDVRy8yQvH46Uo4kXUZJkEn8SUWCD5m63JPW/pCGuFHShLlzs20szzv
ZEFmxMjdLALQGfhV++b1EdEM+xiFqT+X1T1WS9+bRc1ZPj1IH2YQ2n9fOGRQQ790
8wLc3LhMn0qzyZx8wnCRuIpanYWePkLJytv9RDxGoQKBgQDdSIvedOZ8PSI2hKfR
C3ijgh+TCgY6pkpyP6A3AUUHAjcnFV+8qvG6CZVLzEJRxvD7f8sot3W8IdcqGPs9
WiudhPE362bKKd9LMDZH0V77EfqRCz+B3CI6R5NUJVG0DJ3CgnBSDWrvpfngO9I9
QqzxY2K8tBEl7o7bBwwjo83qIw==
  `;

export const stringifyQuery = (query: LocationQueryRaw | undefined): string => {
    if (!query || Object.keys(query).length == 0) return '';

    const jse = new JSEncrypt();
    jse.setPublicKey(PUBLIC_KEY);
    return jse.encrypt(JSON.stringify(query)) as string;
};

export const parseQuery = (query: string): LocationQuery => {
    if (!query) return {};

    const jse = new JSEncrypt();
    jse.setPrivateKey(priviate);
    return JSON.parse(jse.decrypt(query) as string);
};
