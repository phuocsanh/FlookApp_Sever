const models = require("../../models");
const mongoose = require('mongoose');
const messages = require("../../constants/messages");
const handleError = require("../../error/HandleError");
const { addDays } = require("../../functions/globalFunc");

module.exports = {

   addReview : async (req, res) => {
    const idUser = req.userIsLogged._id;
    // console.log("addReview 1234111111", idUser)
  
   
      const review = new models.reviews({ ...req.body, users: idUser });
      review.save()
        .then((data) =>
          res.status(200).send({
            data: data,
            success: true,
            message: messages.CreateSuccessfully,
          })
        )
        .catch((error) => {
          handleError.ServerError(error, res);
        });
    
  },

   likeReview : async (req, res) => {
    // console.log("🚀 ~ file: review.js ~ line 30 ~ likeReview: ~ likeReview")
    try {
      const idUser = req.userIsLogged._id;
      // console.log("🚀 ~ file: review.js ~ line 32 ~ likeReview: ~ idUser", idUser)
      const reviewId = req.query.reviewId
      // console.log("🚀 ~ file: review.js ~ line 34 ~ likeReview: ~ reviewId", reviewId)
      
      const review = await models.reviews.findById(reviewId);
      const containUserId = review?.likes?.includes(idUser)
       
        let condition = containUserId ?   { $pull: { "likes": idUser }} : {$addToSet: {"likes": idUser}}
      
       const likeReview = await models.reviews.findByIdAndUpdate(reviewId, condition , {new:true})
       if(!likeReview){
        return res.status(400).send({message:"like thất bại", success:false})
       }
       return res.status(200).send({data:likeReview, message:"like success", success:true})
    } catch (error) {
      handleError.ServerError(error, res);
    }
 
  },


  updateReview: async (req, res) => {
 
    try {

      const user = req.userIsLogged;
      console.log("🚀 ~ file: review.js ~ line 34 ~ updateReview: ~ user", user)
      const reviewId = req.query.reviewId;
      const option = { new: true };
      console.log("🚀 ~ file: review.js ~ line 37 ~ updateReview: ~ reviewId", reviewId)
      let find
      for (const role of user.roles) {
        if (role.name == "Moderator" || role.name == "Admin") {
          find = { _id: reviewId }
          break;
        } else {
          find = { _id: reviewId, users: user._id.toString() }
          break;
        }
      }
      console.log("🚀 ~ file: review.js ~ line 39 ~ updateReview: ~ find", find)

    
      const review = { ...req.body, updateAt: Date.now() };
      const result = await models.reviews.findOneAndUpdate(
        find,
        review,
        option
      );
      if(!result) {
        return res.status(400).send({ success: false,message: messages.UpdateFail});
      }
      const response = {
        data: result,
        success:true,
        message: messages.UpdateSuccessfully,
      };
      return res.status(200).send(response);
    } catch (error) {
      handleError.ServerError(error, res);
    }
  
},
  

  findOneReview: (req, res) => {
    
  },
  searchReview: async (req, res) =>{
    try {
      // console.log('SEARCH REVIEW',req.query.ebookId)
      const result = await models.reviews.aggregate([
        {$match: {deleted: false, 'ebooks': new mongoose.Types.ObjectId(req.query.ebookId) }},
        {$lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'reviewId',
          as: 'comments', 
          pipeline: [
            {$match: {deleted: false}},
            {$lookup: {
              from: 'comments',
              localField: '_id',
              foreignField: 'commentId',
              as: 'commentsChild',
              pipeline: [
                {$match: {deleted: false}},
                {$lookup: {
                  from: 'users',
                  localField: 'userId',
                  foreignField: '_id',
                  as: 'userId',
                  pipeline: [
                    {$match: {deleted: false}},
                    {$project: {deviceToken: 1, displayName:1, images:'$images.avatar.url'}}
                  ]
                }},
                {$project: {userId: 1,reviewId: 1, likes: 1, createAt: 1, content: 1}}

              ]}},
              {$lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userId',
                pipeline: [
                  {$match: {deleted: false}},
                  {$project: {deviceToken: 1, displayName:1, images:'$images.avatar.url'}}
                ]
              }},
            {$project: {commentsChild: 1, userId: 1,reviewId: 1, likes: 1, createAt: 1, content: 1, countCommentChild: {$size: '$commentsChild'}}}
          ]}},
          {$lookup: {
            from: 'users',
            localField: 'users',
            foreignField: '_id',
            as: 'users',
            pipeline: [
              {$match: {deleted: false}},
              {$project: {deviceToken: 1, displayName:1,  images:'$images.avatar.url'}}
            ]
          }},
          {$sort:{createAt:-1}}

      ])
      if(!result){
       return res.status(400).send({success: false, message:messages.GetDataNotSuccessfully});
      }
       return res.status(200).send({success: true, countReview: result.length, data: result, message:messages.GetDataSuccessfully});
    } catch (error) {
      return handleError.ServerError(error, res)
    }
   

  },

  findManyReview: async (req, res) => {
    const populate = ['users', 'ebooks']
    try {
      Promise.all([
        models.reviews.find({ deleted: false }).populate(populate),
        models.reviews.find().count()
      ]).then((result) => {
        return res.status(200).send({data: result[0], count: result[1], success: true, message: messages.GetDataSuccessfully});
      })
    } catch (error) {
      return handleError.ServerError(error, res);
    }
  },

  insertOneReview: async (req, res) => {
    const user = req.userIsLogged;
    let Review;
    if (req.body.content.trim().length === 0) {
      res.status(400).send({ message: 'Nội dung không được để trống' });
    } else {
      for (const role of user.roles) {
        if (role.name === "Moderator" || role.name === "Admin") {
          Review = new models.reviews({ ...req.body })
          break;
        } else {
          Review = new models.reviews({ ...req.body, users: user._id.toString() });
          break;
        }
      }
      // const Comment = new models.comments({ ...req.body });
      Review.save()
        .then((data) =>
          res.status(200).send({
            data: data,
            status: 200,
            message: messages.CreateSuccessfully,
          })
        )
        .catch((error) => {
          console.log(`error ${error}`);
          handleError.ServerError(error, res);
        });
    }
  },

  updateOneReview: async (req, res) => {
    try {
      const user = req.userIsLogged;
      const reviewId = req.query.id;
      const option = { new: true };
      let find
      for (const role of user.roles) {
        if (role.name == "Moderator" || role.name == "Admin") {
          find = { _id: reviewId }
          break;
        } else {
          find = { _id: reviewId, users: user._id.toString() }
          break;
        }
      }
    
      const review = { ...req.body, updateAt: addDays(0) };
      const result = await models.reviews.findOneAndUpdate(
        find,
        review,
        option
      );
      if(!result) {
        return res.status(400).send({ success: false,message: messages.UpdateFail});
      }
      const response = {
        data: result,
        success:true,
        message: messages.UpdateSuccessfully,
      };
      return res.status(200).send(response);
    } catch (error) {
      handleError.ServerError(error, res);
    }
  },

  insertManyReview: async (req, res) => {},

  deleteOneReview: async (req, res) => {
    try {
      const reviewId = req.query.id;
      const result = await models.reviews.deleteOne({_id:reviewId});
      if(result.deletedCount === 0) {
        return res.status(400).send({ success: false,message: messages.DeleteNotSuccessfully});}
      const response = {
        success: true,
        message: messages.DeleteSuccessfully,
      };
      return res.status(200).send(response);
    
    } catch (error) {
      handleError.ServerError(error, res);
    }
  },

  deleteManyReview: async (req, res) => {
    const listReviewId = req.body.listReviewId;
    try {
      const result = await models.reviews.updateMany(
        { "_id": { $in: listReviewId } }, 
        { $set: { deleted: true, deleteAt: Date.now() } },
        { new: true }
      );
      if(!result){
        return res.status(400).send({ success: false,message: messages.DeleteFail});
      }
      const response = {
        success: true,
        message: messages.RemoveSuccessfully,
      };
      return res.status(200).send(response);
    } catch (error) {
      handleError.ServerError(error, res);
    }
  },

  removeOneReview: async (req, res) => {
    try {
      const user = req.userIsLogged;
      const reviewId = req.query.id;
      const option = { new: true };
      let find
      for (const role of user.roles) {
        if (role.name == "Moderator" || role.name == "Admin") {
          find = { _id: reviewId }
          break;
        } else {
          find = { _id: reviewId, users: user._id }
          break;
        }
      }
      const review = { deleted:true, deleteAt: addDays(0)};
      const result = await models.reviews.findOneAndUpdate(find,review, option);
      if(!result) {
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

  removeManyReview: async (req, res) => {
    const listReviewId  = req.body
    try {
      const result = await models.reviews.updateMany(
        { "_id": { $in: listReviewId } }, 
        { $set: { deleted: true, deleteAt: addDays(0) } },
        { new: true }
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

  // searchReview: async (req, res) =>{
  //   try {
  //     const comicId = req.query.idComic;
  //     const sort = req.query.sortReview;
  //     const rating = req.query.rating;
  //     let page = parseInt(req.query.page);
  //     const PAGE_SIZE = 10;
  //     page < 0 ? (page = 1) : (page = page);
  //     const skip = (page - 1) * PAGE_SIZE;
    
  //     if (!comicId) {
  //       return res.status(400).send({ messages: messages.NotFound });
  //     } else {
  //       if (page && !sort && !rating) {
  //         console.log("get all phân trang");
  //         try {
  //           const result = await models.reviews.find({ ebooks: comicId, deleted: false })
  //             .skip(skip)
  //             .limit(PAGE_SIZE);
  //           return res.status(200).send({ data: result, susscess:true, massage:messages.GetDataSuccessfully });
  //         } catch (error) {
  //           handleError.ServerError(error, res);
  //         }
    
  //       }
  //       else if (page && sort && !rating) {
         
  //         try {
  //           const result = await models.reviews.find({ ebooks: comicId, deleted: false })
  //             .skip(skip)
  //             .limit(PAGE_SIZE)
  //             .sort({ createAt: sort === "ASC" ? 1 : -1 });
  //           return res.status(200).send({ data: result, susscess:true, massage:messages.GetDataSuccessfully  });
  //         } catch (error) {
  //           handleError.ServerError(error, res);
  //         }
    
  //       }
  //       else if (page && rating && sort) {
  //         // console.log(`rating ${rating}`);
    
  //         try {
  //           const result = await models.reviews.find({ ebooks: comicId, deleted: false })
  //             .skip(skip)
  //             .limit(PAGE_SIZE)
  //             .sort({ rating: sort === "ASC" ? 1 : -1 });;
  //           return res.status(200).send({ data: result ,susscess:true, massage:messages.GetDataSuccessfully});
  //         } catch (error) {
  //           handleError.ServerError(error, res);
  //         }
    
  //       }
  //       else return res.status(400).send({ susscess:false,messages: messages.NotFound });
  //     }
  //     } catch (error) {
  //       handleError.ServerError(error, res);
  //     }
  // }
 
};
