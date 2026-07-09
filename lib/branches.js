const BRANCHES = [
  { id: 1, name: 'C1 Dark',        address: 'Массив Буюк Ипак Йули 36', lat: 41.310862, lng: 69.288302, manager_username: 'B_o_b_rakh_tigermma' },
  { id: 2, name: 'Ecopark Cafe',   address: 'Узбекистон Овози 28',      lat: 41.311676, lng: 69.292960, manager_username: 'zubayrmma' },
  { id: 3, name: 'Shevchenko Cafe', address: 'Шевченко 21А',             lat: 41.297168, lng: 69.281061, manager_username: 'sob1rov_f1' },
  { id: 4, name: 'Boulevard Cafe',  address: 'Укчи 6',                   lat: 41.316910, lng: 69.245351, manager_username: 'Ibn_Abdulloh' },
  { id: 5, name: 'SeoulMun Cafe',   address: 'Баходыра 69/1',            lat: 41.298851, lng: 69.246487, manager_username: 'I_A_R_10' },
  { id: 6, name: 'Beruni Cafe',     address: 'Беруни 41',                lat: 41.344840, lng: 69.204587, manager_username: 'shislam_099' },
];

const FACTORY = {
  id: 0, name: 'Фабрика', address: '1-й проезд Мукими 23а',
  lat: 41.277943, lng: 69.246124, manager_username: 'nicknet97',
};

const DRIVER = { name: 'Развозчик', phone: '+998935664333' };

module.exports = { BRANCHES, FACTORY, DRIVER };
