// To fit : y = x + 10

const xs = tf.tensor2d([ -2.0, -1.0, 0.0, 1.0, 2.0, 3.0, 4.0 ] , [7,1] )
const ys = tf.tensor2d([ 8.0, 9.0, 10.0, 11.0, 12.0, 13.0 ,14.0 ] , [7,1])

const model = tf.sequential()
model.add(tf.layers.dense({units: 1, inputShape: [1]}))
model.compile({
    loss: 'meanSquaredError',
    optimizer: 'sgd'
})
model.summary()

model.fit(xs,ys,
{
    epochs: 200,
    callbacks: {
        onEpochEnd: async(epoch, log) => {
            console.log("E:",epoch,"   loss:", log.loss)
        }
    }
})
.then(
    console.log( model.predict(tf.tensor2d([50.0], [1,1])) )
)

