import { fireEvent, render, screen } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import type { MockedFunction } from "vitest";
import { vi } from "vitest";

import { TopHeader } from "../top-header";

vi.mock("iconoir-react-native", () => ({
  EditPencil: () => null,
  MoreHoriz: () => null,
  NavArrowLeft: () => null,
}));

vi.mock("expo-router", () => ({
  useRouter: vi.fn(),
}));

vi.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 8, left: 0, right: 0, bottom: 0 }),
}));

const mockedUseRouter = useRouter as MockedFunction<typeof useRouter>;

describe("TopHeader", () => {
  it("calls router.back when back button is pressed without custom handler", () => {
    const back = vi.fn();
    mockedUseRouter.mockReturnValue({ back } as unknown as ReturnType<
      typeof useRouter
    >);

    render(<TopHeader title="Profile" backButton />);
    fireEvent.press(screen.getByRole("button", { name: "Retour" }));

    expect(back).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Profile")).toBeTruthy();
  });

  it("uses custom back handler when provided", () => {
    const back = vi.fn();
    const onBack = vi.fn();
    mockedUseRouter.mockReturnValue({ back } as unknown as ReturnType<
      typeof useRouter
    >);

    render(<TopHeader backButton onBack={onBack} />);
    fireEvent.press(screen.getByRole("button", { name: "Retour" }));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(back).not.toHaveBeenCalled();
  });

  it("renders and handles edit and more buttons", () => {
    const onEdit = vi.fn();
    const onMore = vi.fn();
    mockedUseRouter.mockReturnValue({ back: vi.fn() } as unknown as ReturnType<
      typeof useRouter
    >);

    render(<TopHeader editButton moreButton onEdit={onEdit} onMore={onMore} />);

    fireEvent.press(screen.getByRole("button", { name: "Modifier" }));
    fireEvent.press(screen.getByRole("button", { name: "Plus" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onMore).toHaveBeenCalledTimes(1);
  });

  it("renders user details when userItem is provided", () => {
    mockedUseRouter.mockReturnValue({ back: vi.fn() } as unknown as ReturnType<
      typeof useRouter
    >);

    render(
      <TopHeader
        userItem={{
          avatarUri: "https://example.com/avatar.png",
          userName: "Max",
          message: "Online",
        }}
      />,
    );

    expect(screen.getByText("Max")).toBeTruthy();
    expect(screen.getByText("Online")).toBeTruthy();
  });
});
