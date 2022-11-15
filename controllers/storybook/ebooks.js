const cloudinary = require('../../configs/cloudnary');
const handleError = require("../../error/HandleError");
const messages = require("../../constants/messages");
const folder = { folder: 'Flex-ticket/ImageBook' }
const models = require("../../models");
const mongoose = require('mongoose');
const { addDays, addArrayDays } = require('../../functions/globalFunc');
const showEbook = { title:1, images:1, authors:1, genres:1, status:1, description:1, allowedAge:1, views:1, createAt: 1}


module.exports = {

  findOneEbook: async (req, res) => {
    try {
      const id = req.query.id;
      const result = await models.ebooks.findById(id)
      result && res.status(200).send({success: true, data: result});
    } catch (error) {
      return handleError.ServerError(error, res);
    }
  },

  findManyEbook: async (req, res) => {
    try {
      const result = await models.ebooks.find({deleted:false}).populate([{path: 'authors', select: ['name']}, {path: 'genres', select: ['name']}])
      result && res.status(200).send({success: true, data: result});
    } catch (error) {
      return handleError.ServerError(error, res);
    }
  },

  insertOneEbook: async (req, res) => {

  },

  insertOneEbook: async (req, res) => {
    const dataBook = req.body.title;
    const itemTrash = req.body.authors.pop() && req.body.genres.pop();
    try {
      const title = await models.ebooks.findOne({ title: dataBook });
  
      if (title) {
        console.log("tên sách tồn tại!!!");
        return res.status(400).send({message: `tên ${title.title} đã tồn tại!!!`});
      }
  
      const imageUpload = await cloudinary.uploader.upload(req.file?.path, folder);
      const newBook = new models.ebooks({
        ...req.body, images: { background: { id: imageUpload.public_id, url: imageUpload.secure_url }, wallPaper: { id: imageUpload.public_id, url: imageUpload.secure_url } }, createAt: addDays(0)
      });
  
      const result = await newBook.save();
      if (result) {
        const response = {
          data: result,
          message: messages.CreateSuccessfully,
          success: true
        }
        return res.status(200).send(response);
      }
    } catch (error) {
      handleError.ServerError(error, res);
    }
  },

  insertManyEbook: async (req, res) => {

  },
 

  updateOneEbook: async (req, res) => {
    const id = req.query.id;
    const itemTrash = req.body.genres.pop() && req.body.authors.pop();
    const image = req.body.images;
    const option = { new: true };
    let imageUpload
    try {
      const bookFind = await models.ebooks.findById(id);
      if (req.file) {
        await cloudinary.uploader.destroy(bookFind.images.background.id);
        imageUpload = await cloudinary.uploader.upload(req.file?.path, folder);
      } else {
        imageUpload = await cloudinary.uploader.upload(image, folder);
        await cloudinary.uploader.destroy(bookFind.images.background.id);
      }
  
      const updateBook = new models.ebooks({
        ...req.body, images: { background: { id: imageUpload.public_id, url: imageUpload.secure_url }, wallPaper: { id: imageUpload.public_id, url: imageUpload.secure_url } }, updateAt: addDays(0), createAt: bookFind.createAt, deleteAt: bookFind.deleteAt
      });
  
      const result = await models.ebooks.findByIdAndUpdate(id, updateBook, option);
  
      if (!result) {
        return handleError.NotFoundError(id, res)
      }
      return res.status(200).send({ message: messages.UpdateSuccessfully, data: result });
    } catch (error) {
      return handleError.ServerError(error, res)
    }
  },

  deleteOneEbook: async (req, res) => {
    const id = req.params.id;
    const bookFind = await models.ebooks.findById(id);
    let row;
  
    try {
      row = await models.ebooks.findByIdAndDelete(id).exec() && await cloudinary.uploader.destroy(bookFind.image.id);
      console.log(row);
      if (!row) {
        console.log(messages.NotFound);
        return res.status(404).send({ messages: messages.NotFound + id });
      }
      console.log(messages.DeleteSuccessfully);
      return res.status(200).send({ messages: messages.DeleteSuccessfully });
    } catch (error) {
      return handleError.ServerError(error, res)
    }
  },

  deleteManyEbook: async (req, res) => {

  },

  removeOneEbook: async (req, res) => {
    const option = { new: true };
    const id = req.query.id;
    const bookFind = await models.ebooks.findById(id);
    let row;
  
    try {
  
      if (bookFind.deleted === true) {
        row = await models.ebooks.findByIdAndUpdate(id, { deleted: false, deleteAt: "", updateAt: bookFind.updateAt, createAt: bookFind.createAt }, option);
      } else {
        row = await models.ebooks.findByIdAndUpdate(id, { deleted: true, deleteAt: addDays(0), updateAt: bookFind.updateAt, createAt: bookFind.createAt }, option);
      }
      console.log(row);
      if (!row) {
        console.log(messages.NotFound);
        return res.status(404).send({ message: messages.NotFound + id });
      }
      console.log(messages.DeleteSuccessfully);
      return res.status(200).send({ message: messages.DeleteSuccessfully });
    } catch (error) {
      return handleError.ServerError(error, res)
    }
  },

  removeManyEbook: async (req, res) => {
    const listDelete = req.body;
    const option = { new: true };
    try {
      const result = await models.ebooks.updateMany(
        { "_id": { $in: listDelete } }, 
        { $set: { deleted: true, deleteAt: Date.now() } },
        option
      );
      if(!result){
        return res.status(400).send({ success: false,message: messages.DeleteFail});
      }
      const response = {
        success: true,
        message: messages.DeleteSuccessfully,
      };
      return res.status(200).send(response);
    } catch (error) {
      handleError.ServerError(error, res);
    }
  },


  
  searchEbook: async (req, res) =>{
    console.log('searchEbook')
    try {
      const { author, genre, status, allowedAge, newDay, chapter } = req.body;
      const { sort, page, orderby } = req.query;
      const match=[{}], pageSize = 20, skip = page ? (parseInt(page) - 1) * pageSize : null

    
    
      const select = [ 
        {$match: {deleted: false, $and: match }},
        {$lookup: {from: 'authors',localField: 'authors',foreignField: '_id',as: 'authors', pipeline: [{$match: {deleted: false}},{$project: {name: 1, images: '$images.avatar.url'}}]}},
        {$lookup: {from: 'genres',localField: 'genres',foreignField: '_id',as: 'genres', pipeline: [{$match: {deleted: false}},{$project: {name: 1}}]}},
        {$lookup: {from: 'reviews',localField: '_id',foreignField: 'ebooks',as: 'reviews',pipeline: [{$match: {deleted: false}}]}},
        {$lookup: {from: 'chapters',localField: '_id',foreignField: 'ebooks',as: 'chapters', pipeline: [{$match: {deleted: false}}]}},
        {$lookup: {from: 'users',localField: '_id',foreignField: 'subscribe.ebooks',as: 'subscribers',pipeline: [{$match: {deleted: false}}]}},
        {$lookup: {from: 'users',localField: '_id',foreignField: 'history.read.ebooks',as: "readers",pipeline: [{$match: {deleted: false}}]}},
        {$lookup: {from: 'comments',localField: 'reviews._id',foreignField: 'reviewId',as: 'commentsReview',pipeline: [{$match: {deleted: false}}]}},
        {$lookup: {from: 'comments',localField: 'chapters._id',foreignField: 'chapterId',as: 'commentsChapter',pipeline: [{$match: {deleted: false}}]}},
        {$project: {...showEbook,
          sumHot: { $sum: [
            {$size: '$reviews'}, 
            {$size: '$reviews.likes'}, 
            {$size: '$chapters.likes'}, 
            {$size: '$commentsReview'}, 
            {$size: '$commentsChapter'}, 
            {$size: '$commentsReview.likes'}, 
            {$size: '$commentsChapter.likes'}
          ]},
          avgScore:{'$divide': [{'$trunc':{'$add':[{'$multiply': [{$avg:'$reviews.rating' }, 100]}, 0.5]}}, 100]},
          subscribers: {$size: { "$setUnion": [ "$subscribers._id", [] ]}},
          sumPage: {$size: { '$setUnion': [ '$chapters._id', [] ]}}, 
          readers: {$sum: {$size: '$readers'}},
        }},

      ]
    
      if(genre && genre.length > 0){
        match.push({genres: {$in: genre.map((e) => mongoose.Types.ObjectId(e)) }})
      }
      if(author && author.length > 0){
        match.push({authors: {$in: author.map((e) => mongoose.Types.ObjectId(e)) }})
      }
      if(status && status.length > 0){
        match.push({status: status[0]})
      }
      if(newDay){
        match.push({createAt:{$in: addArrayDays('EBOOKS_NEW')}})
      }
      if(chapter) {
        switch (chapter) {
          case 'lte50': match.push({sumPage: {$lte: 50}}); break;
          case 'lte100': match.push({sumPage: {$lte: 100 }}); break;
          case 'lte300': match.push({sumPage: {$lte: 300 }}); break;
          case 'gte500': match.push({sumPage: {$gte: 500 }}); break;
          default: break;
        }
      }
      if(allowedAge) {
        switch (allowedAge) {
          case 11: match.push({allowedAge:{ $lte: 11  }}); break;
          case 18: match.push({allowedAge:{ $lte: 18, $gte:12 }}); break;
          default: break;
        }
      }
      if(sort) {
        switch (sort) {
          case 'hot':
            select.push({$sort:{sumHot: parseInt(orderby) || -1}})
            break;
          case 'name':
            select.push({$sort:{title: parseInt(orderby) || -1}})
            break;
          case 'view':
            select.push({$sort:{view: parseInt(orderby)|| -1}})
            break;
          case 'score':
            select.push({$sort:{avgScore: parseInt(orderby) || -1}})
            break;
          case 'reader':
            select.push({$sort:{readers: parseInt(orderby)|| -1}})
            break;
          case 'subscribers':
            select.push({$sort:{subscribers: parseInt(orderby) || -1}})
            break;
          default: break;
        }
      } 
      page && select.push({$skip: skip },{$limit: pageSize })
      const result = await models.ebooks.aggregate(select)
      if(!result){
        return res.status(400).send({success: false,message:"search error"})
      }
      return res.status(200).send({success: true, length: result.length, data: result, message:"search successfully"})
    } catch (error) {
      return handleError.ServerError(error, res)
    }
  },


  filterEbookChannel: async (req, res) => {
    // console.log("filter ebook");
    try {
  
      const PAGE_SIZE =20;
      const numPages = parseInt(req.query.page)
      const skip = numPages ? (numPages - 1) * PAGE_SIZE : null
      const { author, genre, status, allowedAge, sort } = req.body;
    
      let find, populate = ['authors', 'genres']
  
      let alowAgeCondition, sortCondition
  
      if (allowedAge.length > 0) {
        // console.log("allowedAge[0].allowed", allowedAge[0])
        switch (allowedAge[0]) {
          case 11: alowAgeCondition = { $lte: 11 }
            break;
          case 17: alowAgeCondition = { $lte: 17 , $gte:12 }
          break;
          case 18: alowAgeCondition = { $gte:18 }
            break;
          default: alowAgeCondition = null
            break;
        }
      }
  
      // console.log("alowAgeCondition", alowAgeCondition);
    
    // console.log("chapterCondition", chapterCondition);
      if (sort.length > 0) {
        // console.log("Có vào sort")
        // console.log("Vào name" , sort[0])
        switch (sort[0].title) {
        
          case "name":
            if (sort[0].type === 1) {            
              sortCondition = { title: 1 }
            } else sortCondition = { title: -1 }
            break;
          case "view":
            if (sort[0].type === 1) {
              sortCondition = { views: 1 }
            } else sortCondition = { views: -1 }
            break;
          case "date":
            if (sort[0].type === 1) {
              sortCondition = { createAt: 1 }
            } else sortCondition = { createAt: -1 }
            break;
  
          default: sortCondition = null
            break;
        }
      }
  
      if (author.length == 0  && genre.length == 0 && allowedAge.length == 0 && status.length == 0) {
        find = null
      } else {
        // console.log('có condition')
        find = {
          $and: [
            genre.length  > 0 ? { genres:  { $in: genre }} : {},
            author.length > 0 ? { authors:  { $in: author }} : {},
            status.length > 0 ? { status: status[0] } : {},
            allowedAge.length > 0 ? { allowedAge: alowAgeCondition } : {},
           
          ]
        }
      }

      //  console.log('sort condition', sortCondition)
      const count = await models.ebooks.find(find).count();
  
      if (sort.length > 0) {
        // console.log("Vào đây ");
        result = await models.ebooks.find(find).populate(populate).skip(skip).limit(PAGE_SIZE).sort(sortCondition);
      }
      else if (sort.length === 0) {
        result = await models.ebooks.find(find).populate(populate).skip(skip).limit(PAGE_SIZE);
      }
  
     res.status(200).send({ data: { data: result, count: count }, success: true, message: messages.GetDataSuccessfully })
  
  
    } catch (error) {
      return handleError.ServerError(error, res)
    }
  },

  findManyByUser: async (req, res) => {
    try {
      const userId = req.userIsLogged._id, {type} = req.query
      let localField

      switch (type) {
        case 'readed':
          localField = 'history.read.ebooks'
          break;
        case 'bought':
          localField = 'history.bought.ebooks'
          break;
        case 'download':
          localField = 'history.download.ebooks'
          break;
        case 'subscribe':
          localField = 'subscribe.ebooks'
          break;
        default: break;
      }
      const result = await models.users.aggregate([
        {$match: {deleted: false, isActive: true, _id: new mongoose.Types.ObjectId(userId)}},
        {
          $lookup: {
            from: 'ebooks', 
            localField: localField, 
            foreignField: '_id',
            as:'data', 
            pipeline: [
              {$match: {deleted: false}},
              {$lookup: {from: 'authors',localField: 'authors',foreignField: '_id',as: 'authors', pipeline: [{$match: {deleted: false}},{$project: {name: 1, images: '$images.avatar.url'}}]}},
              {$lookup: {from: 'genres',localField: 'genres',foreignField: '_id',as: 'genres', pipeline: [{$match: {deleted: false}},{$project: {name: 1}}]}},
              {$lookup: {from: 'users',localField: '_id',foreignField: 'history.read.ebooks',as: "readers",pipeline: [{$match: {deleted: false}}]}},
              {$lookup: {from: 'reviews',localField: '_id',foreignField: 'ebooks',as: 'reviews',pipeline: [{$match: {deleted: false}}]}},
              {$lookup: {from: 'chapters',localField: '_id',foreignField: 'ebooks',as: 'chapters', pipeline: [{$match: {deleted: false}}]}},
              {$lookup: {from: 'comments',localField: 'reviews._id',foreignField: 'reviewId',as: 'commentsReview',pipeline: [{$match: {deleted: false}}]}},
              {$lookup: {from: 'comments',localField: 'chapters._id',foreignField: 'chapterId',as: 'commentsChapter',pipeline: [{$match: {deleted: false}}]}},
              {$project: {...showEbook, 
                readers: {$sum: {$size: '$readers'}},
                avgScore:{'$divide': [{'$trunc':{'$add':[{'$multiply': [{$avg:'$reviews.rating' }, 100]}, 0.5]}}, 100]},
                sumPage: {$size: { '$setUnion': [ '$chapters._id', [] ]}}, 
                sumComment: { $sum: [
                  {$size: '$commentsReview'}, 
                  {$size: '$commentsChapter'}
                ]},
                sumHot: { $sum: [
                  {$size: '$reviews'}, 
                  {$size: '$reviews.likes'}, 
                  {$size: '$chapters.likes'}, 
                  {$size: '$commentsReview'}, 
                  {$size: '$commentsChapter'}, 
                  {$size: '$commentsReview.likes'}, 
                  {$size: '$commentsChapter.likes'}
                ]},
              }},
            ]
          }
        },
      ])
      result && res.status(200).send({success:true, count: result[0].data.length, data: result[0].data })
} catch (error) {
      return handleError.ServerError(error, res)
    }
  },

  changePassword: async (req, res) => {
    const userId = req.userIsLogged._id.toString();
    const passwordNew = req.body.password_New
    
    try {
      const result = await models.users.findOneAndUpdate(
        { _id: userId },
        { password: await models.users.hashPassword(passwordNew) },
        { new: true, upsert: true }
      );
      if (!result) {
        return res.status(400).send({ message: "Update that bai" });
      }
      return res.status(200).send({data: result, success: true, message: 'Change Password Successfully!!!'});
    } catch (error) {
      return handleError.ServerError(error, res)
    }
  },

 
}



const findNewDate = async (req, res, next) => {
  try {
    const booksnews = addArrayDays('EBOOKS_NEW')
    const result = await models.ebooks.find({createAt: {$in: booksnews}})
    if( result && result.length > 0 ) {
      return res.status(200).send({data: result, success: true})
    } else if (result.length <= 0) {
      return res.status(200).send({data: result, success: false, error: {message: 'No data'}})
    } else if (!result) {
      return res.status(400).send({data: result, success: false, error: {message: 'Can not found data'}})
    }
  } catch (error) {
    handleError.ServerError(error, res)
  }
}








// const findMangaByGenre = async (req, res) => {

//   try {
//     const genreName = req.query.genreName;
//     const sort = req.query.sort;

//     const genre = await models.genres.find({ name: { $in: genreName } })
//     console.log(genre)

//     if (genre.length === 0) {
//       console.log(messages.NotFound);
//       return res.status(404).send({ messages: messages.NotFound + genreName });
//     }

//     const result = await models.ebooks.find({ genre: genre })
//     return res.status(200).send(result);

//   } catch (error) {
//     handleError.ServerError(error, res);
//   }

// };

// const findMangaByAuthor = async (req, res) => {

//   try {
//     const autherName = req.query.autherName;
//     const title = await models.ebooks.find({ title: { $in: req.body.title } });
//     const sort = req.query.sort;

//     const auther = await models.authors.find({ name: { $in: autherName } })

//     if (auther.length === 0) {
//       console.log(messages.NotFound);
//       return res.status(404).send({ messages: messages.NotFound + autherName });
//     }

//     const result = await models.ebooks.find({ auther: auther })
//     return res.status(200).send(result);

//   } catch (error) {
//     handleError.ServerError(error, res);
//   }

// };






