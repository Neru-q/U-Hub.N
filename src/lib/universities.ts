export interface University {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string;
  province: string;
}

export const southAfricanUniversities: University[] = [
  // Traditional Universities
  { id: "uct", name: "University of Cape Town", shortName: "UCT", province: "Western Cape" },
  { id: "wits", name: "University of the Witwatersrand", shortName: "Wits", province: "Gauteng" },
  { id: "stellenbosch", name: "Stellenbosch University", shortName: "SU", province: "Western Cape" },
  { id: "pretoria", name: "University of Pretoria", shortName: "UP", province: "Gauteng" },
  { id: "ukzn", name: "University of KwaZulu-Natal", shortName: "UKZN", province: "KwaZulu-Natal" },
  { id: "rhodes", name: "Rhodes University", shortName: "RU", province: "Eastern Cape" },
  { id: "ufh", name: "University of Fort Hare", shortName: "UFH", province: "Eastern Cape" },
  { id: "uwc", name: "University of the Western Cape", shortName: "UWC", province: "Western Cape" },
  { id: "ul", name: "University of Limpopo", shortName: "UL", province: "Limpopo" },
  { id: "nwu", name: "North-West University", shortName: "NWU", province: "North West" },
  { id: "ufs", name: "University of the Free State", shortName: "UFS", province: "Free State" },
  { id: "unisa", name: "University of South Africa", shortName: "UNISA", province: "Gauteng" },
  { id: "unizulu", name: "University of Zululand", shortName: "UNIZULU", province: "KwaZulu-Natal" },
  { id: "univen", name: "University of Venda", shortName: "UNIVEN", province: "Limpopo" },
  
  // Universities of Technology
  { id: "cput", name: "Cape Peninsula University of Technology", shortName: "CPUT", province: "Western Cape" },
  { id: "cut", name: "Central University of Technology", shortName: "CUT", province: "Free State" },
  { id: "dut", name: "Durban University of Technology", shortName: "DUT", province: "KwaZulu-Natal" },
  { id: "mut", name: "Mangosuthu University of Technology", shortName: "MUT", province: "KwaZulu-Natal" },
  { id: "tut", name: "Tshwane University of Technology", shortName: "TUT", province: "Gauteng" },
  { id: "vut", name: "Vaal University of Technology", shortName: "VUT", province: "Gauteng" },
  
  // Comprehensive Universities
  { id: "uj", name: "University of Johannesburg", shortName: "UJ", province: "Gauteng" },
  { id: "nmmu", name: "Nelson Mandela University", shortName: "NMU", province: "Eastern Cape" },
  { id: "wsu", name: "Walter Sisulu University", shortName: "WSU", province: "Eastern Cape" },
  { id: "spu", name: "Sol Plaatje University", shortName: "SPU", province: "Northern Cape" },
  { id: "ump", name: "University of Mpumalanga", shortName: "UMP", province: "Mpumalanga" },
];

export const getUniversityById = (id: string): University | undefined => {
  return southAfricanUniversities.find(u => u.id === id);
};

export const getUniversitiesByProvince = (province: string): University[] => {
  return southAfricanUniversities.filter(u => u.province === province);
};

export const provinces = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];
