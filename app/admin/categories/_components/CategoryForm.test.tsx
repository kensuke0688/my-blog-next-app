import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CategoryForm from "./CategoryForm";

describe("CategoryForm", () => {
  test("カテゴリー名が空のまま送信すると、エラーを表示しonSubmitを呼ばない", async () => {
    const onSubmit = vi.fn();
    render(<CategoryForm submitLabel="作成する" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "作成する" }));

    expect(
      await screen.findByText("カテゴリー名を入力してください。")
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("カテゴリー名を入力して送信すると、その値でonSubmitが呼ばれる", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CategoryForm submitLabel="作成する" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("カテゴリー名"), {
      target: { value: "React" },
    });
    fireEvent.click(screen.getByRole("button", { name: "作成する" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: "React" });
    });
  });

  test("onSubmitが失敗したら、そのエラーメッセージを表示する", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("保存に失敗しました。"));
    render(<CategoryForm submitLabel="作成する" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("カテゴリー名"), {
      target: { value: "React" },
    });
    fireEvent.click(screen.getByRole("button", { name: "作成する" }));

    expect(await screen.findByText("保存に失敗しました。")).toBeInTheDocument();
  });

  test("initialValuesがあれば、その値がフォームに初期表示される", () => {
    render(
      <CategoryForm
        initialValues={{ name: "既存カテゴリー" }}
        submitLabel="更新する"
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByLabelText("カテゴリー名")).toHaveValue("既存カテゴリー");
  });
});
