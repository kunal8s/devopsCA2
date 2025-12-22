const Institution = require('../../models/Institution');
const ApiResponse = require('../../utils/helpers/apiResponse');
const asyncHandler = require('../../utils/helpers/asyncHandler');
const {
  UNIVERSITY_NAMES,
  COLLEGE_NAMES,
  BRANCHES,
  DEFAULT_YEARS,
} = require('../../utils/constants/academics');

const generateBranches = (type) => {
  if (type === 'college') {
    return BRANCHES.filter((b) => b.category === 'tech').map((b) => ({
      ...b,
      code: b.code,
      years: DEFAULT_YEARS,
    }));
  }
  return BRANCHES.map((b) => ({
    ...b,
    code: b.code,
    years: DEFAULT_YEARS,
  }));
};

const seedDefaults = async () => {
  const count = await Institution.countDocuments();
  if (count > 0) return;

  const universities = UNIVERSITY_NAMES.map((name) => ({
    name,
    code: name.split('(')[0].trim().toUpperCase().replace(/\s+/g, '_').slice(0, 12),
    type: 'university',
    branches: generateBranches('university'),
    status: 'active',
  }));

  const colleges = COLLEGE_NAMES.map((name) => ({
    name,
    code: name.split(' ')[0].toUpperCase().replace(/\W+/g, '').slice(0, 12),
    type: 'college',
    branches: generateBranches('college'),
    status: 'active',
  }));

  await Institution.insertMany([...universities, ...colleges]);
};

// List institutions with optional type filter
exports.listInstitutions = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const query = { status: 'active' };
  if (type) query.type = type;

  await seedDefaults();
  const institutions = await Institution.find(query).select('name code type branches');

  res
    .status(200)
    .json(new ApiResponse(200, institutions, 'Institutions fetched successfully'));
});

// Get academic structure for a specific institution
exports.getStructure = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await seedDefaults();
  const institution = await Institution.findById(id).select('name code type branches');

  if (!institution) {
    return res.status(404).json(new ApiResponse(404, null, 'Institution not found'));
  }

  const branches =
    institution.type === 'college'
      ? institution.branches.filter((b) => b.category === 'tech')
      : institution.branches;

  res.status(200).json(
    new ApiResponse(200, {
      id: institution._id,
      name: institution.name,
      code: institution.code,
      type: institution.type,
      branches,
    }),
  );
});

