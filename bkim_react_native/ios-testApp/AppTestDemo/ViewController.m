//
//  ViewController.m
//  AppTestDemo
//
//  Created by wangyh on 2017/1/9.
//  Copyright © 2017年 wangyh. All rights reserved.
//

#import "ViewController.h"
#import <BKIM_ReactNative_Framework/BKIM_ReactNative_Framework.h>

@interface ViewController ()

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.
}


- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction) showAbout {
    BKIM_RN *bkim = [[BKIM_RN alloc]init];
    [bkim showAbout:self:@"测试程序 💻"];
}

- (void) prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    if ([segue.identifier isEqualToString: @"segue4LoadBKIM"]||[segue.identifier isEqualToString: @"segue4TalkTo"]){
        BKIM_RNViewController *bkim = (BKIM_RNViewController *)segue.destinationViewController;
        
        bkim.productName = @"BKIM 测试程序";
        bkim.isDebug = YES;
        
        bkim.imServerUrl = [self.ip.text stringByAppendingString:@":7778/boke-messager"];
        bkim.hostServerUrl = [self.ip.text stringByAppendingString:@":8080/im-service/${service}.json"];
        bkim.peerId = self.peerId.text;
        bkim.token = [@"dev-mode-test-token:" stringByAppendingString:self.peerId.text];
        
        if ([segue.identifier isEqualToString:@"segue4TalkTo"]){
            bkim.talk2PeerId = self.talkToId.text;
        }else{
            bkim.talk2PeerId = nil;
        }
    }
}

@end
