import React, { useEffect, useState } from "react";
import Board from "./Components/Board/Board";
import { Search, X } from "react-feather";
import "./App.css";
import Editable from "./Components/Editabled/Editable";

function App() {
  const [boards, setBoards] = useState(
    JSON.parse(localStorage.getItem("prac-kanban")) || []
  );
  const [searchQuery, setSearchQuery] = useState(""); // Search state
  const [filteredBoards, setFilteredBoards] = useState(boards); // Filtered board state
  const [targetCard, setTargetCard] = useState({ bid: "", cid: "" });
  const [showSearchInput, setShowSearchInput] = useState(false);

  const toggleSearch = () => {
    setShowSearchInput(!showSearchInput);
    setSearchQuery(""); // Reset search when closing
  };

  // Update filtered boards based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredBoards(boards);
      return;
    }

    const filtered = boards.filter((board) =>
      board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      board.cards.some(
        (card) =>
          card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (card.desc && card.desc.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );

    setFilteredBoards(filtered);
  }, [searchQuery, boards]);

  const addBoardHandler = (name) => {
    const tempBoards = [...boards];
    tempBoards.push({
      id: Date.now() + Math.random() * 2,
      title: name,
      cards: [],
    });
    setBoards(tempBoards);
  };

  const removeBoard = (id) => {
    const tempBoards = boards.filter((item) => item.id !== id);
    setBoards(tempBoards);
  };

  const addCardHandler = (id, title) => {
    const tempBoards = [...boards];
    const boardIndex = tempBoards.findIndex((item) => item.id === id);
    if (boardIndex < 0) return;

    tempBoards[boardIndex].cards.push({
      id: Date.now() + Math.random() * 2,
      title,
      labels: [],
      desc: "",
      date: "",
      tasks: [],
    });

    setBoards(tempBoards);
  };

  const removeCard = (bid, cid) => {
    const tempBoards = [...boards];
    const boardIndex = tempBoards.findIndex((item) => item.id === bid);
    if (boardIndex < 0) return;

    tempBoards[boardIndex].cards = tempBoards[boardIndex].cards.filter(
      (item) => item.id !== cid
    );

    setBoards(tempBoards);
  };

  const updateCard = (bid, cid, updatedCard) => {
    const tempBoards = [...boards];
    const boardIndex = tempBoards.findIndex((item) => item.id === bid);
    if (boardIndex < 0) return;

    const cardIndex = tempBoards[boardIndex].cards.findIndex(
      (item) => item.id === cid
    );
    if (cardIndex < 0) return;

    tempBoards[boardIndex].cards[cardIndex] = updatedCard;
    setBoards(tempBoards);
  };

  const dragEnded = (bid, cid) => {
    let s_boardIndex = boards.findIndex((item) => item.id === bid);
    let s_cardIndex = boards[s_boardIndex]?.cards?.findIndex(
      (item) => item.id === cid
    );
    let t_boardIndex = boards.findIndex((item) => item.id === targetCard.bid);
    let t_cardIndex = boards[t_boardIndex]?.cards?.findIndex(
      (item) => item.id === targetCard.cid
    );

    if (s_boardIndex < 0 || s_cardIndex < 0 || t_boardIndex < 0 || t_cardIndex < 0) return;

    const tempBoards = [...boards];
    const sourceCard = tempBoards[s_boardIndex].cards[s_cardIndex];

    tempBoards[s_boardIndex].cards.splice(s_cardIndex, 1);
    tempBoards[t_boardIndex].cards.splice(t_cardIndex, 0, sourceCard);
    
    setBoards(tempBoards);
    setTargetCard({ bid: "", cid: "" });
  };

  const dragEntered = (bid, cid) => {
    if (targetCard.cid === cid) return;
    setTargetCard({ bid, cid });
  };

  useEffect(() => {
    localStorage.setItem("prac-kanban", JSON.stringify(boards));
  }, [boards]);

  return (
    <div className="app">
      <div className="app_nav">
        <h1>Kanban Board</h1>
        <div className="search-container">
          {showSearchInput ? (
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          ) : null}
          <button className="search-icon" onClick={toggleSearch}>
            {showSearchInput ? <X /> : <Search />}
          </button>
        </div>
      </div>

      <div className="app_boards_container">
        <div className="app_boards">
          {filteredBoards.map((board) => (
            <Board
              key={board.id}
              board={board}
              addCard={addCardHandler}
              removeBoard={() => removeBoard(board.id)}
              removeCard={removeCard}
              dragEnded={dragEnded}
              dragEntered={dragEntered}
              updateCard={updateCard}
            />
          ))}
          <div className="app_boards_last">
            <Editable
              displayClass="app_boards_add-board"
              editClass="app_boards_add-board_edit"
              placeholder="Enter Board Name"
              text="Add Board"
              buttonText="Add Board"
              onSubmit={addBoardHandler}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
