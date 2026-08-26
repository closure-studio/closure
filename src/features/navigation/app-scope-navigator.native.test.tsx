import { render } from '@testing-library/react-native';

type NativeStackProps = React.PropsWithChildren<{
  screenOptions: {
    animation: string;
    contentStyle: { backgroundColor: string };
    headerShown: boolean;
  };
}>;

const mockStack = jest.fn<React.ReactNode, [NativeStackProps]>(({ children }) => children);
const mockStackScreen = jest.fn(() => null);

jest.mock('expo-router/stack', () => ({
  Stack: Object.assign(mockStack, { Screen: mockStackScreen }),
}));

const AppScopeNavigator = jest.requireActual<
  typeof import('./app-scope-navigator.native')
>('./app-scope-navigator.native').AppScopeNavigator;

describe('native AppScopeNavigator', () => {
  beforeEach(() => {
    mockStack.mockClear();
    mockStackScreen.mockClear();
  });

  it('uses the platform-native transition for complete scope screens', async () => {
    await render(<AppScopeNavigator />);

    const stackCall = mockStack.mock.calls.at(-1);
    if (!stackCall) throw new Error('Expected Native Stack props.');
    expect(stackCall[0].screenOptions).toEqual({
      animation: 'default',
      contentStyle: { backgroundColor: 'transparent' },
      headerShown: false,
    });
    expect(mockStackScreen).toHaveBeenNthCalledWith(1, { name: 'dashboard' }, undefined);
    expect(mockStackScreen).toHaveBeenNthCalledWith(2, { name: 'settings' }, undefined);
  });
});
