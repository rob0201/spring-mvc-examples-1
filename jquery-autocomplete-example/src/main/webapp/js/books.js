/*******************************************************************************
 * global variables
 */

var bookServiceUrl = 'http://localhost:8080/hibernate-search-example/library/books/';

/*******************************************************************************
 * index.html / search.html functions
 */

function onLoadList() {
    $.getJSON(bookServiceUrl, renderBookList);
}

function onLoadSearch() {
    var title = $('#title').attr('value');
    if (title == "") {
        $('#bookCount').hide();
        $('#bookList').hide();
    } else {
        var searchUrl = bookServiceUrl + 'search?title=' + $('#title').attr('value');
        $.getJSON(searchUrl, renderBookList);
    }
}

function onClickSearch() {
    onLoadSearch();
    return false;
}

function onClickPrevList() {
    $.getJSON(bookServiceUrl + '?firstResult='
            + $('#prev').find('a').attr('idx'), renderBookList);
    return false;
}

function onClickNextList() {
    $.getJSON(bookServiceUrl + '?firstResult='
            + $('#next').find('a').attr('idx'), renderBookList);
    return false;
}

function renderBookList(bookList) {
    $('.bookRow').remove();
    if (bookList.books.length == 0) {
        var title = $('#title').attr('value');
        $('#bookCount').html('Library contains no books' + (title ? ' starting with \'' + title + '\'' : ''));
        $('#bookList').hide();
    } else {
        renderBookCount(bookList);

        var morePages = (bookList.nextResult != null || bookList.prevResult != null);
        var prevSibling = $('#book_0');
        $.each(bookList.books, function(i, book) {
            var tr = $('#book_0').clone();
            tr.attr('class', 'bookRow');
            tr.attr('id', 'book_' + (i + 1));
            var viewLink = tr.find('td.bookTitle').find('a');
            viewLink.attr('href', viewLink.attr('href') + book.bookId);
            viewLink.html(book.title);
            tr.find('td.bookAuthor').html(book.author);
            var editLink = tr.find('td.editBook').find('a');
            editLink.attr('href', editLink.attr('href') + book.bookId);
            prevSibling.after(tr);
            prevSibling = tr;
            tr.show();
        });
        renderNavLinks(bookList);
        $('#bookData').html(JSON.stringify(bookList));
        $('#bookList').show();
    }
}

function renderBookCount(bookList) {
    var title = $('#title').attr('value');
    var morePages = (bookList.nextResult != null || bookList.prevResult != null);
    if (morePages) {
        $('#bookCount').html(
                'Displaying ' + (bookList.firstResult + 1) + ' - '
                        + (bookList.firstResult + bookList.count) + ' of '
                        + bookList.total + ' books' + (title ? ' starting with \'' + title + '\'' : ''));
    } else {
        $('#bookCount').html(
                'Displaying ' + bookList.count + ' of ' + bookList.total
                        + ' books' + (title ? ' starting with \'' + title + '\'' : ''));
    }
    $('#bookCount').show();
}

function renderNavLinks(bookList) {
    var morePages = (bookList.nextResult != null || bookList.prevResult != null);
    if (morePages) {
        if (bookList.prevResult != null) {
            var prevLink = $('#prev a');
            prevLink.attr('idx', bookList.prevResult);
            prevLink.html('Prev&nbsp;' + bookList.maxResults);
            prevLink.show();
        } else {
            $('#prev a').hide();
        }
        if (bookList.nextResult != null) {
            var nextLink = $('#next a');
            nextLink.attr('idx', bookList.nextResult);
            nextLink.html('Next&nbsp;' + bookList.maxResults);
            nextLink.show();
        } else {
            $('#next a').hide();
        }
        $('.navRow').show();
    } else {
        $('.navRow').hide();
    }
}

function onClickPrevSearch() {
    $.getJSON(bookServiceUrl + 'search.html?title=' + $('#title').attr('value') + '&firstResult='
            + $('#prev').find('a').attr('idx'), renderBookList);
    return false;
}

function onClickNextSearch() {
    $.getJSON(bookServiceUrl + 'search.html?title=' + $('#title').attr('value') + '&firstResult='
            + $('#next').find('a').attr('idx'), renderBookList);
    return false;
}

function searchTimer() {
    var currentText = $('#title').attr('value');
    if (currentText != searchText) {
        searchText = currentText;
        onLoadSearch();
    }
    setTimeout(searchTimer, 1000);
}

function autoComplete(request, response) {
    var searchUrl = bookServiceUrl + 'search?title=' + request.term;
    $.getJSON(searchUrl, function(bookList) {
        var results = [];
        $.each(bookList.books, function(i, book) {
            results.push(book.title);
        });
        response(results);
    });
}

/*******************************************************************************
 * addForm.html functions
 */

function onSubmitAdd() {
    $.post(bookServiceUrl, $('form').serializeArray(), function() {
        window.location = 'index.html';
    }, 'json');
    return false;
}

/*******************************************************************************
 * editForm.html functions
 */

function onLoadEditForm() {
    var bookId = $.url().param('bookId');
    if (bookId == null) {
        $('#editForm').replaceWith('<p>Missing bookId.</p>');
    } else {
        $.getJSON(bookServiceUrl + 'book/' + bookId, function(book) {
            $('#title').attr('value', book.title);
            $('#author').attr('value', book.author);
            $('#bookId').attr('value', book.bookId);
            $('#bookData').replaceWith(JSON.stringify(book));
        });
    }
}

function onSubmitEdit() {
    var book = $('form').serializeJSON();
    delete book.submit;
    $.ajax(bookServiceUrl + 'book/' + $('#bookId').attr('value'), {
        type : 'PUT',
        contentType : 'application/json',
        data : JSON.stringify(book),
        processData : false,
        success : function() {
            window.location = 'index.html';
        }
    });
    return false;
}

/*******************************************************************************
 * view.html functions
 */

function onLoadView() {
    var bookId = $.url().param('bookId');
    if (bookId == null) {
        $('#bookView').replaceWith('<p>Missing bookId.</p>');
    } else {
        $.getJSON(bookServiceUrl + 'book/' + bookId, function(book) {
            $('#title').html(book.title);
            $('#author').html(book.author);
            $('#editForm').attr('action',
                    $('#editForm').attr('action') + book.bookId);
            $('#bookData').replaceWith(JSON.stringify(book));
        });
    }
}