import express from "express";
import {
  addBook,
  deleteBook,
  findBookAndUpdate,
  getAllBooks,
  getBookById,
  getBookByIsbn,
  getBorrowedBooks,
} from "../models/Book/BookModel.js";
import {
  getTransactionByQuery,
  postTransaction,
  updateTransaction,
} from "../models/Transaction/TransactionModel.js";
import { getUserById } from "../models/User/UserModel.js";

const router = express.Router();

// get all books
router.get("/", async (req, res, next) => {
  try {
    const books = await getAllBooks();
    if (books) {
      return res.status(200).json({
        books,
      });
    }
    return;
  } catch (error) {
    next(error);
  }
});

// get books borrowed by specific user

router.get("/borrowedByUser", async (req, res, next) => {
  try {
    const result = await getBorrowedBooks(req.headers.authorization);
    return res.json(result);
  } catch (error) {
    next(error);
  }
});

// add a book
router.post("/", async (req, res, next) => {
  const { isbn } = req.body;

  try {
    const bookExists = await getBookByIsbn({ isbn });

    if (bookExists?._id) {
      return res.json({ status: "error", message: "Book already exists!" });
    }

    const book = await addBook(req.body);
    if (book?._id) {
      return res.json({
        status: "success",
        message: "Book added successfully!",
      });
    }
    res.json({
      status: "error",
      message: "Unable to add book. Please try again later!",
    });
  } catch (error) {
    next(error);
  }
});

// borrow a book
router.post("/borrow", async (req, res, next) => {
  try {
    const bookId = req.body.bookId;
    const { authorization } = req.headers;

    const book = await getBookById(bookId);
    const user = await getUserById(authorization);
    if (book?._id && user?._id) {
      if (book?.borrowedBy.length) {
        return res.json({
          status: "error",
          message:
            "This book has already been borrowed and will be available once it has been returned!",
        });
      }
    }

    const { isbn, thumbnail, title, author, year } = book;

    const transaction = await postTransaction({
      borrowedBy: {
        userId: user._id,
        userFname: user.fName,
        userLname: user.lName,
      },
      borrowedBook: {
        isbn,
        thumbnail,
        title,
        author,
        year,
      },
    });

    if (transaction?._id) {
      const updateBook = await findBookAndUpdate(bookId, {
        borrowedBy: [...book.borrowedBy, user._id],
      });

      return updateBook?._id
        ? res.json({
            status: "success",
            message: "You have borrowed this book!",
            updateBook,
          })
        : res.json({
            status: "error",
            message: "Something went wrong. Please try again later!",
          });
    }

    return res.json({
      status: "error",
      message: "Unable to register transaction!",
    });
  } catch (error) {
    next(error);
  }
});

// delete Book
router.delete("/", async (req, res, next) => {
  try {
    const del = await deleteBook(req.body.bookId);

    del?._id
      ? res.json({
          status: "success",
          message: "Book has been deleted from the system!",
        })
      : res.json({
          status: "error",
          message: "Unable to delete. Please try again later!",
        });
  } catch (error) {
    next(error);
  }
});

//return book
router.patch("/return", async (req, res, next) => {
  try {
    const book = await getBookById(req.body.bookId);
    const user = await getUserById(req.headers.authorization);

    const transaction = await getTransactionByQuery(user._id, book.isbn);
    const updateTrans = await updateTransaction(transaction?._id, {
      returnDate: new Date(),
    });

    if (updateTrans?.returnDate) {
      const updateBook = await findBookAndUpdate(book._id, {
        $pull: { borrowedBy: user._id },
      });

      updateBook?._id
        ? res.json({
            status: "success",
            message: "You have returned this book.",
          })
        : res.json({
            status: "error",
            message: "Unable to return book. Please try again later!",
          });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
