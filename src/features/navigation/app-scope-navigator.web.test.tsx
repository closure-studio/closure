import { render } from '@testing-library/react-native';

type WebStackProps = React.PropsWithChildren<{
  screenOptions: {
    animation: string;
    cardStyle: { backgroundColor: string };
    headerShown: boolean;
    transitionSpec: {
      close: { animation: string; config: { duration: number } };
      open: { animation: string; config: { duration: number } };
    };
  };
}>;

const mockStack = jest.fn<React.ReactNode, [WebStackProps]>(({ children }) => children);
const mockStackScreen = jest.fn(() => null);

jest.mock('expo-router/js-stack', () => ({
  Stack: Object.assign(mockStack, { Screen: mockStackScreen }),
}));

const AppScopeNavigator = jest.requireActual<
  typeof import('./app-scope-navigator.web')
>('./app-scope-navigator.web').AppScopeNavigator;

describe('web AppScopeNavigator', () => {
  it('uses an explicit horizontal JS-stack transition', async () => {
    await render(<AppScopeNavigator />);

    const stackCall = mockStack.mock.calls.at(-1);
    if (!stackCall) throw new Error('Expected Web Stack props.');
    expect(stackCall[0].screenOptions).toEqual({
      animation: 'slide_from_right',
      cardStyle: { backgroundColor: 'transparent' },
      headerShown: false,
      transitionSpec: {
        close: { animation: 'timing', config: { duration: 200 } },
        open: { animation: 'timing', config: { duration: 200 } },
      },
    });
    expect(mockStackScreen).toHaveBeenCalledTimes(2);
  });
});
