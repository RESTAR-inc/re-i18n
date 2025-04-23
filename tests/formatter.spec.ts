import { formatter } from "../src";

describe("formatter", () => {
  it("should replace placeholders with values", () => {
    const result = formatter("en", "Hello {name}, welcome to {place}", {
      name: "John",
      place: "Earth",
    });
    expect(result).toBe("Hello John, welcome to Earth");
  });

  it("should replace placeholders with empty string if value is undefined", () => {
    const result = formatter("en", "Hello {name}, welcome to {place}", {
      name: undefined,
      place: "Earth",
    });
    expect(result).toBe("Hello , welcome to Earth");
  });

  it("should return the original message if no params are provided", () => {
    const result = formatter("en", "Hello {name}, welcome to {place}");
    expect(result).toBe("Hello {name}, welcome to {place}");
  });
});
