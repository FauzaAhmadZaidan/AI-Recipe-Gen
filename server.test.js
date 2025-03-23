const request = require("supertest"); // Mengimpor Supertest untuk pengujian HTTP
const app = require("./server"); // Mengimpor server dari file server.js

// Grup pengujian untuk endpoint /get-recipe
describe("Pengujian Endpoint /get-recipe", () => {
  // Pengujian pertama: Input bahan valid
  test("Mengembalikan status 200 jika input bahan valid", async () => {
    const response = await request(app)
      .post("/get-recipe") // Melakukan request POST ke /get-recipe
      .send({ ingredients: ["chicken", "tomato"] }); // Mengirimkan input bahan

    // Assert hasil pengujian
    expect(response.statusCode).toBe(200); // Harus mengembalikan status 200
    expect(response.body).toHaveProperty("message", "Input bahan valid"); // Memiliki pesan yang sesuai
  });

 // Pengujian kedua: Input bahan kosong
  test("Mengembalikan status 400 jika input bahan kosong", async () => {
    const response = await request(app)
      .post("/get-recipe") // Melakukan request POST ke /get-recipe
      .send({ ingredients: [] }); // Mengirimkan input bahan kosong

    // Assert hasil pengujian
    expect(response.statusCode).toBe(400); // Harus mengembalikan status 400
    expect(response.body.message).toBe("Bahan tidak boleh kosong"); // Memiliki pesan error yang sesuai
  });
});
