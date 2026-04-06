export const BUILD_INFO = {
  version: '1.2.5',
  buildDate: '2026-04-06',
  buildNumber: '20260406-0930',
  environment: 'production',
  commitHash: 'b8e4d9f',
  author: 'Nani Technologies',
  license: 'Proprietary'
};

export function getBuildInfo() {
  return BUILD_INFO;
}

export function getFormattedVersion() {
  return `v${BUILD_INFO.version} (build ${BUILD_INFO.buildNumber})`;
}