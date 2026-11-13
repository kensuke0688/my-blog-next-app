import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PostListItem, { type PostListItemPost } from "./PostListItem";

const post: PostListItemPost = {
  id: 1,
  title: "テスト記事",
  createdAt: "2026-01-15T12:00:00.000Z",
};

describe("PostListItem", () => {
  test("記事タイトルと日付を表示する", () => {
    render(<PostListItem post={post} isDeleting={false} onDelete={vi.fn()} />);

    expect(screen.getByText("テスト記事")).toBeInTheDocument();
    // タイムゾーンに依存しないよう、コンポーネントと同じ変換方法で期待値を作る
    const expectedDate = new Date(post.createdAt).toLocaleDateString("ja-JP");
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  test("タイトルが編集ページへのリンクになっている", () => {
    render(<PostListItem post={post} isDeleting={false} onDelete={vi.fn()} />);

    expect(screen.getByRole("link", { name: /テスト記事/ })).toHaveAttribute(
      "href",
      "/admin/posts/1"
    );
  });

  test("削除ボタンを押すと、そのidでonDeleteが呼ばれる", () => {
    const onDelete = vi.fn();
    render(<PostListItem post={post} isDeleting={false} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: "削除" }));

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  test("isDeletingがtrueのとき、削除ボタンが無効化される", () => {
    render(<PostListItem post={post} isDeleting={true} onDelete={vi.fn()} />);

    expect(screen.getByRole("button", { name: "削除" })).toBeDisabled();
  });
});
