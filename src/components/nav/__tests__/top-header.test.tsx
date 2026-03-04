import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { TopHeader } from '../top-header';

jest.mock('@expo/vector-icons/MaterialIcons', () => {
  return function MockMaterialIcon({
    name: _name,
  }: {
    name: string;
  }) {
    return null;
  };
});

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 8, left: 0, right: 0, bottom: 0 }),
}));

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('TopHeader', () => {
  it('calls router.back when back button is pressed without custom handler', () => {
    const back = jest.fn();
    mockedUseRouter.mockReturnValue({ back } as ReturnType<typeof useRouter>);

    render(<TopHeader title="Profile" backButton />);
    fireEvent.press(screen.getByRole('button', { name: 'Retour' }));

    expect(back).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Profile')).toBeTruthy();
  });

  it('uses custom back handler when provided', () => {
    const back = jest.fn();
    const onBack = jest.fn();
    mockedUseRouter.mockReturnValue({ back } as ReturnType<typeof useRouter>);

    render(<TopHeader backButton onBack={onBack} />);
    fireEvent.press(screen.getByRole('button', { name: 'Retour' }));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(back).not.toHaveBeenCalled();
  });

  it('renders and handles edit and more buttons', () => {
    const onEdit = jest.fn();
    const onMore = jest.fn();
    mockedUseRouter.mockReturnValue({ back: jest.fn() } as ReturnType<typeof useRouter>);

    render(<TopHeader editButton moreButton onEdit={onEdit} onMore={onMore} />);

    fireEvent.press(screen.getByRole('button', { name: 'Modifier' }));
    fireEvent.press(screen.getByRole('button', { name: 'Plus' }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onMore).toHaveBeenCalledTimes(1);
  });

  it('renders user details when userItem is provided', () => {
    mockedUseRouter.mockReturnValue({ back: jest.fn() } as ReturnType<typeof useRouter>);

    render(
      <TopHeader
        userItem={{
          avatarUri: 'https://example.com/avatar.png',
          userName: 'Max',
          message: 'Online',
        }}
      />
    );

    expect(screen.getByText('Max')).toBeTruthy();
    expect(screen.getByText('Online')).toBeTruthy();
  });
});
