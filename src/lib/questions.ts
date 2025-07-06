import { Question } from '@/types/question';

export const questions: Question[] = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    starter: "def two_sum(nums, target):\n    \"\"\"\n    Find two numbers that add up to target.\n    \n    Args:\n        nums: List of integers\n        target: Target sum\n    \n    Returns:\n        List of two indices\n    \"\"\"\n    # Write your solution here\n    pass",
    solution: "def two_sum(nums, target):\n    num_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in num_map:\n            return [num_map[complement], i]\n        num_map[num] = i\n    return []",
    hints: [
      "Try using a hash map to store numbers you've seen",
      "For each number, check if its complement exists in the map",
      "The complement is target - current_number"
    ]
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stack",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets in the correct order.",
    examples: [
      {
        input: "s = \"()\"",
        output: "true",
        explanation: "The string contains valid parentheses."
      },
      {
        input: "s = \"()[]{}\",",
        output: "true",
        explanation: "All brackets are properly matched."
      },
      {
        input: "s = \"(]\"",
        output: "false",
        explanation: "Brackets are not properly matched."
      }
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    starter: "def is_valid(s):\n    \"\"\"\n    Check if parentheses are valid.\n    \n    Args:\n        s: String containing only parentheses\n    \n    Returns:\n        Boolean indicating if parentheses are valid\n    \"\"\"\n    # Write your solution here\n    pass",
    solution: "def is_valid(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    \n    for char in s:\n        if char in mapping:\n            if not stack or stack.pop() != mapping[char]:\n                return False\n        else:\n            stack.append(char)\n    \n    return len(stack) == 0",
    hints: [
      "Use a stack data structure",
      "Push opening brackets onto the stack",
      "When you see a closing bracket, check if it matches the top of the stack"
    ]
  },
  {
    id: 3,
    title: "Binary Tree Inorder Traversal",
    difficulty: "Easy",
    category: "Trees",
    description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    examples: [
      {
        input: "root = [1,null,2,3]",
        output: "[1,3,2]",
        explanation: "Inorder traversal visits nodes in left-root-right order."
      },
      {
        input: "root = []",
        output: "[]",
        explanation: "Empty tree returns empty list."
      },
      {
        input: "root = [1]",
        output: "[1]",
        explanation: "Single node returns list with one element."
      }
    ],
    constraints: [
      "The number of nodes in the tree is in the range [0, 100].",
      "-100 <= Node.val <= 100"
    ],
    starter: "# Definition for a binary tree node.\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef inorder_traversal(root):\n    \"\"\"\n    Perform inorder traversal of binary tree.\n    \n    Args:\n        root: TreeNode representing root of binary tree\n    \n    Returns:\n        List of values in inorder sequence\n    \"\"\"\n    # Write your solution here\n    pass",
    solution: "def inorder_traversal(root):\n    result = []\n    \n    def inorder(node):\n        if node:\n            inorder(node.left)\n            result.append(node.val)\n            inorder(node.right)\n    \n    inorder(root)\n    return result",
    hints: [
      "Inorder traversal: left subtree, root, right subtree",
      "Use recursion or an iterative approach with a stack",
      "For recursion: process left, add current value, process right"
    ]
  },
  {
    id: 4,
    title: "Reverse Linked List",
    difficulty: "Easy",
    category: "Linked Lists",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]",
        explanation: "The linked list is reversed."
      },
      {
        input: "head = [1,2]",
        output: "[2,1]",
        explanation: "Two node list is reversed."
      },
      {
        input: "head = []",
        output: "[]",
        explanation: "Empty list remains empty."
      }
    ],
    constraints: [
      "The number of nodes in the list is the range [0, 5000].",
      "-5000 <= Node.val <= 5000"
    ],
    starter: "# Definition for singly-linked list.\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverse_list(head):\n    \"\"\"\n    Reverse a singly linked list.\n    \n    Args:\n        head: ListNode representing head of linked list\n    \n    Returns:\n        ListNode representing head of reversed list\n    \"\"\"\n    # Write your solution here\n    pass",
    solution: "def reverse_list(head):\n    prev = None\n    current = head\n    \n    while current:\n        next_temp = current.next\n        current.next = prev\n        prev = current\n        current = next_temp\n    \n    return prev",
    hints: [
      "Keep track of three pointers: previous, current, and next",
      "Iteratively reverse the links between nodes",
      "Don't forget to update all pointers in each iteration"
    ]
  },
  {
    id: 5,
    title: "Maximum Subarray",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "[4,-1,2,1] has the largest sum = 6."
      },
      {
        input: "nums = [1]",
        output: "1",
        explanation: "Single element array."
      },
      {
        input: "nums = [5,4,-1,7,8]",
        output: "23",
        explanation: "Entire array has the largest sum."
      }
    ],
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    starter: "def max_subarray(nums):\n    \"\"\"\n    Find the maximum sum of contiguous subarray.\n    \n    Args:\n        nums: List of integers\n    \n    Returns:\n        Integer representing maximum subarray sum\n    \"\"\"\n    # Write your solution here\n    pass",
    solution: "def max_subarray(nums):\n    max_sum = nums[0]\n    current_sum = nums[0]\n    \n    for i in range(1, len(nums)):\n        current_sum = max(nums[i], current_sum + nums[i])\n        max_sum = max(max_sum, current_sum)\n    \n    return max_sum",
    hints: [
      "This is a classic dynamic programming problem (Kadane's algorithm)",
      "At each position, decide whether to start a new subarray or extend the current one",
      "Keep track of both current sum and maximum sum seen so far"
    ]
  }
];

export const categories: string[] = ["All", "Arrays", "Stack", "Trees", "Linked Lists", "Dynamic Programming", "Graphs", "Strings"]; 
