require('dotenv').config();

const mongoose = require('mongoose');

const User = require('../models/User');
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');

const SEED_PASSWORD = 'devpass123';
const PRIMARY_USER = {
  name: 'Dev Tester',
  email: 'dev.user@splitsync.local',
  password: SEED_PASSWORD
};

const PEER_USERS = [
  { name: 'Alex Perera', email: 'alex.peer@splitsync.local', password: SEED_PASSWORD },
  { name: 'Maya Fernando', email: 'maya.peer@splitsync.local', password: SEED_PASSWORD },
  { name: 'Rohan Silva', email: 'rohan.peer@splitsync.local', password: SEED_PASSWORD },
  { name: 'Nimal Jayasuriya', email: 'nimal.peer@splitsync.local', password: SEED_PASSWORD },
  { name: 'Sahan Wickramage', email: 'sahan.peer@splitsync.local', password: SEED_PASSWORD }
];

const GROUP_TEMPLATES = [
  {
    name: 'DEV - Colombo Apartment',
    members: [
      PRIMARY_USER.email,
      'alex.peer@splitsync.local',
      'maya.peer@splitsync.local',
      'rohan.peer@splitsync.local'
    ]
  },
  {
    name: 'DEV - Weekend Trips',
    members: [PRIMARY_USER.email, 'maya.peer@splitsync.local', 'nimal.peer@splitsync.local']
  },
  {
    name: 'DEV - Office Lunch',
    members: [PRIMARY_USER.email, 'alex.peer@splitsync.local', 'sahan.peer@splitsync.local']
  },
  {
    name: 'DEV - Family Home',
    members: [PRIMARY_USER.email, 'rohan.peer@splitsync.local', 'nimal.peer@splitsync.local']
  },
  {
    name: 'DEV - Gym Buddies',
    members: [
      PRIMARY_USER.email,
      'sahan.peer@splitsync.local',
      'alex.peer@splitsync.local',
      'maya.peer@splitsync.local'
    ]
  }
];

const EXPENSE_TEMPLATES = [
  {
    group: 'DEV - Colombo Apartment',
    description: 'April Rent Advance',
    amount: 18000,
    paidBy: PRIMARY_USER.email,
    participants: [
      PRIMARY_USER.email,
      'alex.peer@splitsync.local',
      'maya.peer@splitsync.local',
      'rohan.peer@splitsync.local'
    ],
    daysAgo: 170
  },
  {
    group: 'DEV - Colombo Apartment',
    description: 'Utilities Bill',
    amount: 6400,
    paidBy: 'alex.peer@splitsync.local',
    participants: [
      PRIMARY_USER.email,
      'alex.peer@splitsync.local',
      'maya.peer@splitsync.local',
      'rohan.peer@splitsync.local'
    ],
    daysAgo: 140
  },
  {
    group: 'DEV - Weekend Trips',
    description: 'Nuwara Eliya Hotel',
    amount: 12500,
    paidBy: 'maya.peer@splitsync.local',
    participants: [PRIMARY_USER.email, 'maya.peer@splitsync.local', 'nimal.peer@splitsync.local'],
    daysAgo: 110
  },
  {
    group: 'DEV - Office Lunch',
    description: 'Team Lunch Friday',
    amount: 7200,
    paidBy: 'sahan.peer@splitsync.local',
    participants: [PRIMARY_USER.email, 'alex.peer@splitsync.local', 'sahan.peer@splitsync.local'],
    daysAgo: 75
  },
  {
    group: 'DEV - Family Home',
    description: 'Grocery Run',
    amount: 9300,
    paidBy: 'rohan.peer@splitsync.local',
    participants: [PRIMARY_USER.email, 'rohan.peer@splitsync.local', 'nimal.peer@splitsync.local'],
    daysAgo: 40
  },
  {
    group: 'DEV - Gym Buddies',
    description: 'Quarterly Gym Fee',
    amount: 15000,
    paidBy: PRIMARY_USER.email,
    participants: [
      PRIMARY_USER.email,
      'sahan.peer@splitsync.local',
      'alex.peer@splitsync.local',
      'maya.peer@splitsync.local'
    ],
    daysAgo: 12
  }
];

const SETTLEMENT_TEMPLATES = [
  {
    group: 'DEV - Colombo Apartment',
    fromUser: 'alex.peer@splitsync.local',
    toUser: PRIMARY_USER.email,
    amount: 2500,
    daysAgo: 120
  },
  {
    group: 'DEV - Colombo Apartment',
    fromUser: 'rohan.peer@splitsync.local',
    toUser: PRIMARY_USER.email,
    amount: 1800,
    daysAgo: 95
  },
  {
    group: 'DEV - Weekend Trips',
    fromUser: PRIMARY_USER.email,
    toUser: 'maya.peer@splitsync.local',
    amount: 2200,
    daysAgo: 88
  },
  {
    group: 'DEV - Office Lunch',
    fromUser: PRIMARY_USER.email,
    toUser: 'sahan.peer@splitsync.local',
    amount: 1500,
    daysAgo: 50
  },
  {
    group: 'DEV - Family Home',
    fromUser: 'nimal.peer@splitsync.local',
    toUser: 'rohan.peer@splitsync.local',
    amount: 1200,
    daysAgo: 25
  },
  {
    group: 'DEV - Gym Buddies',
    fromUser: 'sahan.peer@splitsync.local',
    toUser: PRIMARY_USER.email,
    amount: 2000,
    daysAgo: 5
  }
];

const toDate = (daysAgo) => {
  const now = new Date();
  return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
};

const seed = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in environment configuration.');
  }

  await mongoose.connect(process.env.MONGO_URI, {
    maxPoolSize: 10,
    minPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000
  });

  const seedEmails = [PRIMARY_USER, ...PEER_USERS].map((user) => user.email.toLowerCase());

  const existingSeedGroups = await Group.find({ name: /^DEV -/i }).select('_id').lean();
  const existingSeedGroupIds = existingSeedGroups.map((group) => group._id);

  if (existingSeedGroupIds.length) {
    await Promise.all([
      Expense.deleteMany({ groupId: { $in: existingSeedGroupIds } }),
      Settlement.deleteMany({ groupId: { $in: existingSeedGroupIds } }),
      Group.deleteMany({ _id: { $in: existingSeedGroupIds } })
    ]);
  }

  await User.deleteMany({ email: { $in: seedEmails } });

  const usersToCreate = [PRIMARY_USER, ...PEER_USERS];
  const createdUsers = await Promise.all(usersToCreate.map((user) => User.create(user)));

  const userByEmail = new Map(createdUsers.map((user) => [user.email.toLowerCase(), user]));

  const groupsToCreate = GROUP_TEMPLATES.map((template) => ({
    name: template.name,
    createdBy: userByEmail.get(PRIMARY_USER.email.toLowerCase())._id,
    members: template.members.map((email) => userByEmail.get(email.toLowerCase())._id)
  }));

  const createdGroups = await Group.insertMany(groupsToCreate);
  const groupByName = new Map(createdGroups.map((group) => [group.name, group]));

  const expensesToCreate = EXPENSE_TEMPLATES.map((template) => {
    const createdAt = toDate(template.daysAgo);

    return {
      groupId: groupByName.get(template.group)._id,
      description: template.description,
      amount: template.amount,
      paidBy: userByEmail.get(template.paidBy.toLowerCase())._id,
      participants: template.participants.map((email) => userByEmail.get(email.toLowerCase())._id),
      splitType: 'equal',
      createdAt,
      updatedAt: createdAt
    };
  });

  const settlementsToCreate = SETTLEMENT_TEMPLATES.map((template) => {
    const createdAt = toDate(template.daysAgo);

    return {
      groupId: groupByName.get(template.group)._id,
      fromUser: userByEmail.get(template.fromUser.toLowerCase())._id,
      toUser: userByEmail.get(template.toUser.toLowerCase())._id,
      amount: template.amount,
      status: 'settled',
      createdAt,
      updatedAt: createdAt
    };
  });

  const [createdExpenses, createdSettlements] = await Promise.all([
    Expense.insertMany(expensesToCreate),
    Settlement.insertMany(settlementsToCreate)
  ]);

  const primary = userByEmail.get(PRIMARY_USER.email.toLowerCase());

  console.log('Development seed completed.');
  console.log(`Primary user email: ${PRIMARY_USER.email}`);
  console.log(`Primary user password: ${SEED_PASSWORD}`);
  console.log(`Primary user id: ${primary._id}`);
  console.log(`Users created: ${createdUsers.length}`);
  console.log(`Groups created: ${createdGroups.length}`);
  console.log(`Expenses created: ${createdExpenses.length}`);
  console.log(`Settlements created: ${createdSettlements.length}`);
};

seed()
  .then(async () => {
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(`Seed failed: ${error.message}`);
    await mongoose.connection.close();
    process.exit(1);
  });
