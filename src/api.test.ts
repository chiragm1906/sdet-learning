import request from 'supertest';

interface TODO {
  userId: number;  // Change to number because userId is numeric
  id: number;
  title: string;
  completed: boolean;
}

interface Geo {
  lat: string;
  lng: string;
}

interface Address {
  geo: Geo;
}

interface User {
  id: number;
  name: string;
  address: Address;
}

const minLat = -40.0;
const maxLat = 5.0;
const minLng = 5.0;
const maxLng = 100.0;

describe('Fancode Scenarios', () => {
  it('All the users of City `FanCode` should have more than half of their todos task completed.', async () => 
    const user_response = await request('https://jsonplaceholder.typicode.com')
      .get('/users')
      .expect(200)
      .expect('Content-Type', /json/);

    const users: User[] = user_response.body;

    // Filter only Fancode City
    const FancodeUsers = users.filter(user => {
      const lat = parseFloat(user.address.geo.lat);
      const lng = parseFloat(user.address.geo.lng);
      return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
    });

    // Extract Fancode user IDs
    const FancodeUserIds = FancodeUsers.map(user => user.id);

    // Fetch todos from the JSONPlaceholder API
    const todo_response = await request('https://jsonplaceholder.typicode.com')
      .get('/todos')
      .expect(200)
      .expect('Content-Type', /json/);

    const todos: TODO[] = todo_response.body;

    // Filter completed todos for Fancode users
    const completedTodosByFancodeUsers = todos.filter(todo =>
      FancodeUserIds.includes(todo.userId) && todo.completed === true
    );

    const totalTodos = todos.length;
    console.log(completedTodosByFancodeUsers.length);
    console.log(totalTodos);

    // Group all todos for user with fancode city
    const todosPerUser = todos.reduce<{ [key: number]: TODO[] }>((acc, todo) => {
      if (FancodeUserIds.includes(todo.userId)) { 
        if (!acc[todo.userId]) { 
          acc[todo.userId] = [];
        }
        acc[todo.userId].push(todo); 
      }
      return acc;
    }, {});

   
    const usersWithOver50PercentCompleted = Object.entries(todosPerUser).map(([userId, userTodos]) => {
      const completedCount = userTodos.filter(todo => todo.completed).length;
      const totalCount = userTodos.length;
      const percentage = (completedCount / totalCount) * 100;

      return {
        userId: Number(userId),
        completedPercentage: percentage,
        isOver50: percentage > 50
      };
    });

    console.log('Users with over 50% completed tasks:', usersWithOver50PercentCompleted);

        // Assert that all Fancode users have completed more than 50% of their tasks
        const failedUsers = usersWithOver50PercentCompleted.filter(user => !user.isOver50);
    
        // Fail the test if any user has completed less than 50%
        expect(failedUsers).toHaveLength(0);
  });
});
