import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import BouquetUploader from "./components/sections/dashboard-uploader-section";

describe("BouquetUploader QA smoke", () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    localStorage.clear();

    // JSDOM doesn't implement these; the component relies on them for previews.
    (URL as any).createObjectURL = jest.fn(() => "blob:mock-preview");
    (URL as any).revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    (URL as any).createObjectURL = originalCreateObjectURL;
    (URL as any).revokeObjectURL = originalRevokeObjectURL;
  });

  test("select image -> preview shows -> clear -> submit calls onUpload with FormData", async () => {
    const user = userEvent.setup();
    const onUpload = jest.fn<Promise<boolean>, [FormData]>(async () => true);

    render(<BouquetUploader onUpload={onUpload} />);

    // Upload an image
    const fileInput = screen.getByLabelText(/upload gambar bouquet/i) as HTMLInputElement;
    const img = new File(["fake"], "bouquet.jpg", { type: "image/jpeg" });
    await user.upload(fileInput, img);

    expect(await screen.findByAltText(/pratinjau/i)).toBeInTheDocument();
    expect(screen.getByText(/bouquet\.jpg/i)).toBeInTheDocument();

    // Clear image
    await user.click(screen.getByRole("button", { name: /hapus/i }));
    expect(await screen.findByLabelText(/belum ada gambar/i)).toBeInTheDocument();

    // Fill required fields
    await user.type(screen.getByLabelText(/nama\s*\*/i), "Orchid Elegance");
    await user.clear(screen.getByLabelText(/harga/i));
    await user.type(screen.getByLabelText(/harga/i), "150000");

    // Submit
    await user.click(screen.getByRole("button", { name: /unggah bouquet/i }));

    await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(1));
    const call = onUpload.mock.calls[0];
    if (!call) throw new Error("Expected onUpload to have been called");
    const fd = call[0];

    expect(fd).toBeInstanceOf(FormData);
    expect(fd.get("name")).toBe("Orchid Elegance");
    expect(fd.get("price")).toBe("150000");
  });

  test("rejects non-image file selection", async () => {
    const user = userEvent.setup();
    const onUpload = jest.fn<Promise<boolean>, [FormData]>(async () => true);

    render(<BouquetUploader onUpload={onUpload} />);

    const bad = new File(["not image"], "notes.txt", { type: "text/plain" });

    const dropzone = screen.getByRole("button", { name: /pilih gambar bouquet/i });
    fireEvent.drop(dropzone, { dataTransfer: { files: [bad] } });

    expect(await screen.findByRole("alert")).toHaveTextContent(/file harus berupa gambar/i);
    expect(screen.queryByAltText(/pratinjau/i)).not.toBeInTheDocument();
  });
});
