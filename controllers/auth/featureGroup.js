const handleError = require('../../error/HandleError')
const modles = require('../../models')

module.exports = {
  findOneFeatureGroup: async (req, res) => {
    try {
      const result = await modles.featuresGroups.aggregate([
        { $lookup: {
          from:"features",
          localField:"_id",
          foreignField: "featureGroup",
          as: "features"
          },
        }
      ])
      if (result) {
        return res.status(200).send({ data: result, success: true })
      }
      else {
        return res.status(400).send({ success: false, message: 'Find many feature group failed' })
      }
    } catch (error) {
      return handleError.ServerError(error, res)
    }
  },

  findManyFeatureGroup: async (req, res) => {

  },

  insertOneFeatureGroup: async (req, res) => {

  },

  insertOneFeatureGroup: async (req, res) => {

  },

  insertManyFeatureGroup: async (req, res) => {

  },

  updateOneFeatureGroup: async (req, res) => {

  },

  deleteOneFeatureGroup: async (req, res) => {

  },

  deleteManyFeatureGroup: async (req, res) => {

  },

  removeOneFeatureGroup: async (req, res) => {

  },

  removeManyFeatureGroup: async (req, res) => {

  },

  searchFeatureGroup: async (req, res) => {

  }
}