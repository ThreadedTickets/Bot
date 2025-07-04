export default {
  free: {
    panels: {
      amount: 10,
      embeds: 3,
    },
    applications: {
      amount: 10,
      questions: {
        amount: 5,
      },
    },
    ticketTriggers: {
      amount: 50,
    },
    groups: {
      amount: 50,
    },
    autoResponders: {
      amount: 10,
      extraChannels: 10,
    },
    tags: {
      amount: 25,
    },
    permissions: {
      amount: 10,
    },
    roles: {
      admin: {
        amount: 10,
      },
      staff: {
        amount: 10,
      },
      blocked: {
        amount: 10,
      },
    },
    channels: {
      movableCategories: 10,
    },

    messages: {
      amount: 250,
      feedback: {
        length: 200,
      },
      content: {
        length: 1500,
      },
      embed: {
        title: {
          length: 100,
        },
        description: {
          length: 1500,
        },
        author: {
          length: 100,
        },
        footer: {
          length: 50,
        },
        field: {
          name: {
            length: 100,
          },
          value: {
            length: 1000,
          },
        },
      },
    },
  },
} as const;
