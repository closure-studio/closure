/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react-native';
import { VerificationSurface } from './verification-surface.web';

it('isolates verification scripts in a sandboxed opaque origin', async () => {
  await render(<VerificationSurface request={{ kind: 'google' }} />);

  expect(screen.toJSON()).toMatchObject({
    props: { sandbox: 'allow-scripts' },
    type: 'iframe',
  });
});
