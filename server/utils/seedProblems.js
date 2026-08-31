import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
import Problem from "../models/Problem.js";

dotenv.config();

const problems = [
  // =========================================================
  // 1. TWO SUM
  // =========================================================
  {
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "easy",
    tags: ["array", "hashmap"],

    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.`,

    constraints:
      "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",

    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
      },
    ],

    testCases: [
      {
        input: "[2,7,11,15]\n9",
        expectedOutput: "[0,1]",
        isHidden: false,
      },
      {
        input: "[3,2,4]\n6",
        expectedOutput: "[1,2]",
        isHidden: false,
      },
      {
        input: "[3,3]\n6",
        expectedOutput: "[0,1]",
        isHidden: true,
      },
      {
        input: "[1,2,3,4,5]\n9",
        expectedOutput: "[3,4]",
        isHidden: true,
      },
    ],

    starterCode: {
      python: `import sys
import json

def two_sum(nums, target):
    # Write your solution here
    pass

lines = sys.stdin.read().strip().split('\\n')

nums = json.loads(lines[0])
target = int(lines[1])

print(json.dumps(two_sum(nums, target)))`,

      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    string numsStr;
    getline(cin, numsStr);

    int target;
    cin >> target;

    // Parse [2,7,11,15]
    numsStr = numsStr.substr(1, numsStr.size() - 2);

    vector<int> nums;
    stringstream ss(numsStr);
    string token;

    while (getline(ss, token, ',')) {
        nums.push_back(stoi(token));
    }

    // Write your solution here

    return 0;
}`,
    },
  },

  // =========================================================
  // 2. REVERSE STRING
  // =========================================================
  {
    title: "Reverse String",
    slug: "reverse-string",
    difficulty: "easy",
    tags: ["string", "two-pointers"],

    description: `Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array in-place with O(1) extra memory.`,

    constraints: "1 <= s.length <= 10^5\ns[i] is a printable ascii character.",

    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
        explanation: "",
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
        explanation: "",
      },
    ],

    testCases: [
      {
        input: '["h","e","l","l","o"]',
        expectedOutput: '["o","l","l","e","h"]',
        isHidden: false,
      },
      {
        input: '["H","a","n","n","a","h"]',
        expectedOutput: '["h","a","n","n","a","H"]',
        isHidden: false,
      },
      {
        input: '["a"]',
        expectedOutput: '["a"]',
        isHidden: true,
      },
      {
        input: '["a","b"]',
        expectedOutput: '["b","a"]',
        isHidden: true,
      },
    ],

    starterCode: {
      python: `import sys
import json

def reverse_string(s):
    # Write your solution here
    pass

s = json.loads(sys.stdin.read().strip())

reverse_string(s)

print(json.dumps(s))`,

      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    string input;
    getline(cin, input);

    vector<string> s;

    // Parse ["h","e","l","l","o"]
    for (int i = 1; i < (int)input.size() - 1; i++) {
        if (input[i] == '"') {
            string current;
            i++;

            while (i < (int)input.size() && input[i] != '"') {
                current += input[i];
                i++;
            }

            s.push_back(current);
        }
    }

    // Write your solution here

    return 0;
}`,
    },
  },

  // =========================================================
  // 3. VALID PARENTHESES
  // =========================================================
  {
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "easy",
    tags: ["string", "stack"],

    description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
- Open brackets must be closed by the same type of brackets.
- Open brackets must be closed in the correct order.
- Every close bracket has a corresponding open bracket of the same type.`,

    constraints:
      "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",

    examples: [
      {
        input: 's = "()"',
        output: "true",
        explanation: "",
      },
      {
        input: 's = "()[]{}"',
        output: "true",
        explanation: "",
      },
      {
        input: 's = "(]"',
        output: "false",
        explanation: "",
      },
    ],

    testCases: [
      {
        input: "()",
        expectedOutput: "true",
        isHidden: false,
      },
      {
        input: "()[]{}",
        expectedOutput: "true",
        isHidden: false,
      },
      {
        input: "(]",
        expectedOutput: "false",
        isHidden: false,
      },
      {
        input: "([)]",
        expectedOutput: "false",
        isHidden: true,
      },
      {
        input: "{[]}",
        expectedOutput: "true",
        isHidden: true,
      },
    ],

    starterCode: {
      python: `import sys

def is_valid(s):
    # Write your solution here
    pass

s = sys.stdin.read().strip()

print(str(is_valid(s)).lower())`,

      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    getline(cin, s);

    // Write your solution here

    return 0;
}`,
    },
  },

  // =========================================================
  // 4. FIZZBUZZ
  // =========================================================
  {
    title: "FizzBuzz",
    slug: "fizzbuzz",
    difficulty: "easy",
    tags: ["math", "string"],

    description: `Given an integer \`n\`, return a string array where:
- answer[i] == "FizzBuzz" if i is divisible by 3 and 5.
- answer[i] == "Fizz" if i is divisible by 3.
- answer[i] == "Buzz" if i is divisible by 5.
- answer[i] == i (as a string) if none of the above conditions are true.`,

    constraints: "1 <= n <= 10^4",

    examples: [
      {
        input: "n = 3",
        output: '["1","2","Fizz"]',
        explanation: "",
      },
      {
        input: "n = 5",
        output: '["1","2","Fizz","4","Buzz"]',
        explanation: "",
      },
    ],

    testCases: [
      {
        input: "3",
        expectedOutput: '["1","2","Fizz"]',
        isHidden: false,
      },
      {
        input: "5",
        expectedOutput: '["1","2","Fizz","4","Buzz"]',
        isHidden: false,
      },
      {
        input: "15",
        expectedOutput:
          '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]',
        isHidden: true,
      },
    ],

    starterCode: {
      python: `import sys
import json

def fizz_buzz(n):
    # Write your solution here
    pass

n = int(sys.stdin.read().strip())

print(json.dumps(fizz_buzz(n)))`,

      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    // Write your solution here
    // Output should be in JSON-array format.
    // Example: ["1","2","Fizz"]

    return 0;
}`,
    },
  },

  // =========================================================
  // 5. PALINDROME NUMBER
  // =========================================================
  {
    title: "Palindrome Number",
    slug: "palindrome-number",
    difficulty: "easy",
    tags: ["math"],

    description: `Given an integer \`x\`, return \`true\` if \`x\` is a palindrome, and \`false\` otherwise.

An integer is a palindrome when it reads the same forward and backward. For example, 121 is a palindrome while 123 is not.`,

    constraints: "-2^31 <= x <= 2^31 - 1",

    examples: [
      {
        input: "x = 121",
        output: "true",
        explanation:
          "121 reads as 121 from left to right and from right to left.",
      },
      {
        input: "x = -121",
        output: "false",
        explanation:
          "From left to right, it reads -121. From right to left, it becomes 121-.",
      },
    ],

    testCases: [
      {
        input: "121",
        expectedOutput: "true",
        isHidden: false,
      },
      {
        input: "-121",
        expectedOutput: "false",
        isHidden: false,
      },
      {
        input: "10",
        expectedOutput: "false",
        isHidden: true,
      },
      {
        input: "0",
        expectedOutput: "true",
        isHidden: true,
      },
    ],

    starterCode: {
      python: `import sys

def is_palindrome(x):
    # Write your solution here
    pass

x = int(sys.stdin.read().strip())

print(str(is_palindrome(x)).lower())`,

      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    long long x;
    cin >> x;

    // Write your solution here
    // Output should be: true or false

    return 0;
}`,
    },
  },

  // =========================================================
  // 6. MAXIMUM SUBARRAY
  // =========================================================
  {
    title: "Maximum Subarray",
    slug: "maximum-subarray",
    difficulty: "medium",
    tags: ["array", "dynamic-programming"],

    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.`,

    constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",

    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
      },
      {
        input: "nums = [1]",
        output: "1",
        explanation: "",
      },
    ],

    testCases: [
      {
        input: "[-2,1,-3,4,-1,2,1,-5,4]",
        expectedOutput: "6",
        isHidden: false,
      },
      {
        input: "[1]",
        expectedOutput: "1",
        isHidden: false,
      },
      {
        input: "[5,4,-1,7,8]",
        expectedOutput: "23",
        isHidden: true,
      },
      {
        input: "[-1,-2,-3]",
        expectedOutput: "-1",
        isHidden: true,
      },
    ],

    starterCode: {
      python: `import sys
import json

def max_sub_array(nums):
    # Write your solution here
    pass

nums = json.loads(sys.stdin.read().strip())

print(max_sub_array(nums))`,

      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    string numsStr;
    getline(cin, numsStr);

    numsStr = numsStr.substr(1, numsStr.size() - 2);

    vector<int> nums;
    stringstream ss(numsStr);
    string token;

    while (getline(ss, token, ',')) {
        nums.push_back(stoi(token));
    }

    // Write your solution here

    return 0;
}`,
    },
  },

  // =========================================================
  // 7. CLIMBING STAIRS
  // =========================================================
  {
    title: "Climbing Stairs",
    slug: "climbing-stairs",
    difficulty: "easy",
    tags: ["dynamic-programming", "math"],

    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,

    constraints: "1 <= n <= 45",

    examples: [
      {
        input: "n = 2",
        output: "2",
        explanation: "There are two ways to climb to the top: 1+1 or 2.",
      },
      {
        input: "n = 3",
        output: "3",
        explanation: "There are three ways: 1+1+1, 1+2, or 2+1.",
      },
    ],

    testCases: [
      {
        input: "2",
        expectedOutput: "2",
        isHidden: false,
      },
      {
        input: "3",
        expectedOutput: "3",
        isHidden: false,
      },
      {
        input: "5",
        expectedOutput: "8",
        isHidden: true,
      },
      {
        input: "10",
        expectedOutput: "89",
        isHidden: true,
      },
    ],

    starterCode: {
      python: `import sys

def climb_stairs(n):
    # Write your solution here
    pass

n = int(sys.stdin.read().strip())

print(climb_stairs(n))`,

      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    // Write your solution here

    return 0;
}`,
    },
  },

  // =========================================================
  // 8. BINARY SEARCH
  // =========================================================
  {
    title: "Binary Search",
    slug: "binary-search",
    difficulty: "easy",
    tags: ["array", "binary-search"],

    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, return its index. Otherwise, return -1.`,

    constraints:
      "1 <= nums.length <= 10^4\n-10^4 < nums[i], target < 10^4\nAll the integers in nums are unique.\nnums is sorted in ascending order.",

    examples: [
      {
        input: "nums = [-1,0,3,5,9,12], target = 9",
        output: "4",
        explanation: "9 exists in nums and its index is 4.",
      },
      {
        input: "nums = [-1,0,3,5,9,12], target = 2",
        output: "-1",
        explanation: "2 does not exist in nums so return -1.",
      },
    ],

    testCases: [
      {
        input: "[-1,0,3,5,9,12]\n9",
        expectedOutput: "4",
        isHidden: false,
      },
      {
        input: "[-1,0,3,5,9,12]\n2",
        expectedOutput: "-1",
        isHidden: false,
      },
      {
        input: "[5]\n5",
        expectedOutput: "0",
        isHidden: true,
      },
      {
        input: "[1,2,3,4,5]\n1",
        expectedOutput: "0",
        isHidden: true,
      },
    ],

    starterCode: {
      python: `import sys
import json

def search(nums, target):
    # Write your solution here
    pass

lines = sys.stdin.read().strip().split('\\n')

nums = json.loads(lines[0])
target = int(lines[1])

print(search(nums, target))`,

      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    string numsStr;
    getline(cin, numsStr);

    int target;
    cin >> target;

    numsStr = numsStr.substr(1, numsStr.size() - 2);

    vector<int> nums;
    stringstream ss(numsStr);
    string token;

    while (getline(ss, token, ',')) {
        nums.push_back(stoi(token));
    }

    // Write your solution here

    return 0;
}`,
    },
  },

  // =========================================================
  // 9. LONGEST COMMON PREFIX
  // =========================================================
  {
    title: "Longest Common Prefix",
    slug: "longest-common-prefix",
    difficulty: "easy",
    tags: ["string"],

    description: `Write a function to find the longest common prefix string amongst an array of strings.

If there is no common prefix, return an empty string "".`,

    constraints:
      "1 <= strs.length <= 200\n0 <= strs[i].length <= 200\nstrs[i] consists of only lowercase English letters.",

    examples: [
      {
        input: 'strs = ["flower","flow","flight"]',
        output: '"fl"',
        explanation: "",
      },
      {
        input: 'strs = ["dog","racecar","car"]',
        output: '""',
        explanation: "There is no common prefix among the input strings.",
      },
    ],

    testCases: [
      {
        input: '["flower","flow","flight"]',
        expectedOutput: "fl",
        isHidden: false,
      },
      {
        input: '["dog","racecar","car"]',
        expectedOutput: "",
        isHidden: false,
      },
      {
        input: '["interview","inter","internal"]',
        expectedOutput: "inter",
        isHidden: true,
      },
      {
        input: '["a"]',
        expectedOutput: "a",
        isHidden: true,
      },
    ],

    starterCode: {
      python: `import sys
import json

def longest_common_prefix(strs):
    # Write your solution here
    pass

strs = json.loads(sys.stdin.read().strip())

print(longest_common_prefix(strs))`,

      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    string input;
    getline(cin, input);

    vector<string> strs;

    // Parse ["flower","flow","flight"]
    for (int i = 1; i < (int)input.size() - 1; i++) {
        if (input[i] == '"') {
            string current;
            i++;

            while (i < (int)input.size() && input[i] != '"') {
                current += input[i];
                i++;
            }

            strs.push_back(current);
        }
    }

    // Write your solution here

    return 0;
}`,
    },
  },

  // =========================================================
  // 10. SINGLE NUMBER
  // =========================================================
  {
    title: "Single Number",
    slug: "single-number",
    difficulty: "easy",
    tags: ["array", "bit-manipulation"],

    description: `Given a non-empty array of integers \`nums\`, every element appears twice except for one. Find that single one.

You must implement a solution with a linear runtime complexity and use only constant extra space.`,

    constraints:
      "1 <= nums.length <= 3 * 10^4\n-3 * 10^4 <= nums[i] <= 3 * 10^4\nEach element in the array appears twice except for one element which appears only once.",

    examples: [
      {
        input: "nums = [2,2,1]",
        output: "1",
        explanation: "",
      },
      {
        input: "nums = [4,1,2,1,2]",
        output: "4",
        explanation: "",
      },
    ],

    testCases: [
      {
        input: "[2,2,1]",
        expectedOutput: "1",
        isHidden: false,
      },
      {
        input: "[4,1,2,1,2]",
        expectedOutput: "4",
        isHidden: false,
      },
      {
        input: "[1]",
        expectedOutput: "1",
        isHidden: true,
      },
      {
        input: "[1,0,1]",
        expectedOutput: "0",
        isHidden: true,
      },
    ],

    starterCode: {
      python: `import sys
import json

def single_number(nums):
    # Write your solution here
    pass

nums = json.loads(sys.stdin.read().strip())

print(single_number(nums))`,

      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    string numsStr;
    getline(cin, numsStr);

    numsStr = numsStr.substr(1, numsStr.size() - 2);

    vector<int> nums;
    stringstream ss(numsStr);
    string token;

    while (getline(ss, token, ',')) {
        nums.push_back(stoi(token));
    }

    // Write your solution here

    return 0;
}`,
    },
  },
];

// =========================================================
// SEED DATABASE
// =========================================================

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    await Problem.deleteMany({});

    console.log("Cleared existing problems");

    await Problem.insertMany(problems);

    console.log(`Seeded ${problems.length} problems successfully`);

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedDB();
