export const getLotes = async () => {
  return [
    {
      id: 1,
      estado: "COMPLETADO",
      processed_rows: 100,
      valid_rows: 95,
      invalid_rows: 5
    },
    {
      id: 2,
      estado: "ERROR",
      processed_rows: 50,
      valid_rows: 30,
      invalid_rows: 20
    },
    {
      id: 3,
      estado: "PROCESADO",
      processed_rows: 80,
      valid_rows: 80,
      invalid_rows: 0
    }
  ];
};