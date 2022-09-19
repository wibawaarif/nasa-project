const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

describe('Launches API', () => {
    beforeAll(async () => {
        await mongoConnect();
    });

    afterAll(async () => {
        await mongoDisconnect();
    });

    describe('Test GET /launches', () => {
        test('It should response with 200 success', async () => {
            const response = await request(app)
            .get('/v1/launches')
            .expect('Content-Type', /json/)
            .expect(200);
        });
    });
    
    
    describe('Test POST /launches', () => {
        const completeLaunchData = {
            mission: 'ESS Andro123',
            rocket: 'Explorer',
            target: 'Kepler-442 b',
            launchDate: 'January 21, 2026'
        };
    
        const launchDataWithoutDate = {
            mission: 'ESS Andro123',
            rocket: 'Explorer',
            target: 'Kepler-442 b',
        }
    
        const launchDataWithInvalidDate = {
            mission: 'ESS Andro123',
            rocket: 'Explorer',
            target: 'Kepler-442 b',
            launchDate: 'test'
        }
    
    
        test('It should response with 201 created', async () => {
            const response = await request(app)
            .post('/v1/launches')
            .send(completeLaunchData)
            .expect('Content-Type', /json/)
            .expect(201);
    
            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);
    
            expect(response.body).toMatchObject(launchDataWithoutDate);
        })
    
        test('It should catch missing required properties', async () => {
            const response = await request(app)
            .post('/v1/launches')
            .send(launchDataWithoutDate)
            .expect('Content-Type', /json/)
            .expect(400);
    
            expect(response.body).toStrictEqual({
                error: 'Fill the mission, rocket, target, and launchDate!'
            }); 
        });
    
        test('It should catch invalid dates', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithInvalidDate)
                .expect('Content-Type', /json/)
                .expect(400);
    
            expect(response.body).toStrictEqual({
                error: 'The launchDate format must be correct!'
            });
        })
    })
})

