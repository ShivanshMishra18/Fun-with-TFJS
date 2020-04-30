// const url='https://raw.githubusercontent.com/lmoroney/dlaicourse/master/TensorFlow%20Deployment/Course%201%20-%20TensorFlow-JS/Week%201/Examples/iris.csv'

const url = 'iris.csv';

async function AI() {

    const trainingData = tf.data.csv(url, {
        columnConfigs: {
            species: {
                isLabel: true
            }
        }
    });

    const numF = ( await trainingData.columnNames() ).length - 1;
    const n = 150;

    const convertedData = trainingData.map(({xs, ys}) => {
        const labels = [
            ys.species === "setosa" ? 1 : 0,
            ys.species === "virginica" ? 1 : 0,
            ys.species === "versicolor" ? 1 : 0
        ]
        return {xs: Object.values(xs), ys: Object.values(labels)}
    }).batch(10);

    const model = tf.sequential({
        layers: [
            tf.layers.dense({inputShape: numF, activation: 'sigmoid', units: 5}),
            tf.layers.dense({activation: 'softmax', units: 3})
        ]
    });

    model.compile({
        loss: 'categoricalCrossentropy',
        optimizer: tf.train.adam(0.067)
    });

    await model.fitDataset(
        convertedData,
        {
            epochs: 100,
            callbacks: {
                onEpochEnd: async (epoch, log) => {
                    console.log(epoch, ': ', log.loss);
                }
            }
        }
    )

    // Test Cases:
            
    // Setosa
    const testVal = tf.tensor2d([4.4, 2.9, 1.4, 0.2], [1, 4]);
    
    // Versicolor
    // const testVal = tf.tensor2d([6.4, 3.2, 4.5, 1.5], [1, 4]);
    
    // Virginica
    // const testVal = tf.tensor2d([5.8,2.7,5.1,1.9], [1, 4]);
    
    const prediction = model.predict(testVal);
    const pIndex = tf.argMax(prediction, axis=1).dataSync();
    
    const classNames = ["Setosa", "Virginica", "Versicolor"];
    
    // alert(prediction)
    alert(classNames[pIndex])

}

AI();