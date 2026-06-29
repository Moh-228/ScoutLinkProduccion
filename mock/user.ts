export type MockUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "coach";
  university: string;
  sport: string;
  city: string;
};

export const mockUser: MockUser = {
  id: "usr-001",
  name: "Moises Perez",
  email: "moises.perez@correo.edu",
  role: "student",
  university: "ESCOM",
  sport: "Básquetbol",
  city: "Monterrey",
};
