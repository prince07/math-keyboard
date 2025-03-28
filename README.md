# Math Keyboard App

A React-based mathematical equation editor with an interactive virtual keyboard for entering mathematical expressions. This application allows users to write and edit mathematical formulas using LaTeX syntax with a user-friendly interface.

## Features

- Interactive math keyboard for entering mathematical expressions
- Real-time preview of rendered mathematical formulas
- Support for both inline ($...$) and display ($$...$$) math modes
- Built-in LaTeX syntax support using MathQuill and KaTeX
- Error handling for invalid LaTeX expressions
- Responsive design with a modern user interface

## Prerequisites

Before running this project, make sure you have:
- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd math-keyboard-app
```

2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the development server:
```bash
npm start
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. To enter mathematical expressions:
   - Click the "f(x)" button to open the math keyboard
   - Use the keyboard to insert mathematical symbols and expressions
   - Type regular text normally in the text area
   - Use $...$ for inline math mode
   - Use $$...$$ for display math mode

## Dependencies

- React 18.2.0
- react-mathquill
- mathquill
- KaTeX
- Other dependencies can be found in `package.json`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
